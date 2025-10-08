'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Navigation from '../../components/Navigation'
import Footer from '../../components/Footer'
import Loading, { Spinner } from '../../components/Loading'
import ProtectedPage from '../../components/ProtectedPage'
// import { useCart } from '../../lib/cart-context'
import { useAuth } from '../../lib/auth-context'
import { 
  registerOrderWithBackend, 
  generateOrderId, 
  type OrderRegistrationData,
  type OrderProduct 
} from '../../lib/data/orders'
import { 
  Gift, 
  Shield, 
  Clock, 
  ArrowLeft, 
  ArrowRight,
  Bitcoin,
  Wallet,
  Check,
  Copy,
  ExternalLink,
  ShoppingCart,
  Coins,
  AlertCircle,
  Eye,
  EyeOff,
  CreditCard,
  Zap,
  Download,
  Mail,
  AlertTriangle
} from '../../components/icons'
import { 
  PaymentMethod, 
  PaymentStatus, 
  PaymentFactory,
  PaymentService,
  type SepaTransferRequest,
  type VirtualCardResponse
} from '../../lib/services/payment-service'
// import { useCart } from '@/lib/cart-context'
import { useCart } from '@/contexts/CartProvider2'

interface CheckoutStep {
  id: number
  title: string
  description: string
  completed: boolean
  active: boolean
}

interface PaymentData {
  id: string
  amount: number
  cryptoAmount: number
  cryptoCurrency: string
  address: string
  qrCode: string
  expiresAt: string
  paymentUrl: string
  network: string
}

interface DeliveredKeys {
  code: string
  productId: string
  productName: string
}

const WEBHOOK_BASE_URL = process.env.NEXT_PUBLIC_WEBHOOK_SERVER_URL || 'https://webhook.88808880.xyz';

export default function CheckoutClient() {
  const router = useRouter()
  // const { state: cartState, clearCart,  } = useCart()
  const {cart, clearCart, } = useCart()
  console.log(cart)
  const { customer } = useAuth()
  
  const [currentStep, setCurrentStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null)
  const [customerEmail, setCustomerEmail] = useState('')
  const [orderId, setOrderId] = useState('')
  const [deliveredKeys, setDeliveredKeys] = useState<DeliveredKeys[]>([])
  const [showKeys, setShowKeys] = useState(false)
  const [deliveryError, setDeliveryError] = useState('')
  const [purchaseCompleted, setPurchaseCompleted] = useState(false)
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'crypto' | 'sepa' | 'virtual_card'>('crypto')
  const [paymentStatus, setPaymentStatus] = useState<'pending' | 'confirmed' | 'failed'>('pending')
  const [deliveryMessage, setDeliveryMessage] = useState<string>('')
  const [emailSent, setEmailSent] = useState<boolean>(false)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [invoiceUrl, setInvoiceUrl] = useState<string | null>(null)
  
  // SEPA Transfer form state
  const [sepaFormData, setSepaFormData] = useState({
    firstName: '',
    lastName: '',
    iban: ''
  })
  
  // Virtual Card form state
  const [virtualCardFormData, setVirtualCardFormData] = useState({
    cardLabel: 'Gift Card Purchase',
    pin: ''
  })

  // New state for P100 USDC balance and address
  const [usdcBalance, setUsdcBalance] = useState<string | null>(null)
  const [usdcAddress, setUsdcAddress] = useState<string | null>(null)
  const [balanceLoading, setBalanceLoading] = useState<boolean>(true)
  const [balanceError, setBalanceError] = useState<string | null>(null)

  // Add state for spending check
  const [spendingBefore, setSpendingBefore] = useState<number | null>(null);
  const [spendingAfter, setSpendingAfter] = useState<number | null>(null);
  const [isPolling, setIsPolling] = useState(false);
  const [pollingError, setPollingError] = useState<string | null>(null);

  const steps: CheckoutStep[] = [
    {
      id: 1,
      title: 'Order Review',
      description: 'Review your gift card selection',
      completed: currentStep > 1,
      active: currentStep === 1
    },
    {
      id: 2,
      title: 'Payment Method',
      description: 'Choose your payment method',
      completed: currentStep > 2,
      active: currentStep === 2
    },
    {
      id: 3,
      title: 'Payment Details',
      description: 'Complete your payment',
      completed: currentStep > 3,
      active: currentStep === 3
    },
    {
      id: 4,
      title: 'Delivery',
      description: 'Receive your gift card codes',
      completed: currentStep > 4,
      active: currentStep === 4
    }
  ]

  useEffect(() => {
    // if (cartState.items.length === 0 && !purchaseCompleted) {
    if (cart?.items?.length === 0 && !purchaseCompleted) {
      setTimeout(() => {
        router.push('/gift-cards')
      }, 2000)
    }
    
    if (customer?.email && customer.email !== 'unknown@email.com') {
      setCustomerEmail(customer.email)
    }
  }, [cart?.items?.length, router, customer, purchaseCompleted])

  // Fetch user info and P100 USDC balance/address on mount (step 3 only)
  useEffect(() => {
    async function fetchUsdcBalance() {
      setBalanceLoading(true)
      setBalanceError(null)
      try {
        const externalUserId = customer?.id
        if (!externalUserId) throw new Error('User ID not found')
        const balanceRes = await fetch(`/api/p100-balance?externalUserId=${externalUserId}`)
        if (!balanceRes.ok) throw new Error('Failed to fetch wallet balances')
        const data = await balanceRes.json()
        const usdc = (data.cryptoBalances || []).find((b: any) => b.name === 'usdc')
        setUsdcBalance(usdc ? usdc.amount : null)
        setUsdcAddress(usdc ? usdc.wallet : null)
      } catch (err: any) {
        setBalanceError(err.message || 'Failed to load balance')
      }
      setBalanceLoading(false)
    }
    if (currentStep === 3 && selectedPaymentMethod === 'crypto') {
      fetchUsdcBalance()
    }
  }, [currentStep, selectedPaymentMethod])

  // Fetch spending before payment when entering crypto payment step
  useEffect(() => {
    async function fetchSpendingBefore() {
      if (selectedPaymentMethod === 'crypto' && currentStep === 3 && customer?.id) {
        console.log('🔍 Fetching spending before payment for customer:', customer.id);
        try {
          const res = await fetch(`${WEBHOOK_BASE_URL}/customer/${customer.id}/spending`);
          const data = await res.json();
          const totalSpent = Number(data.totalSpent) || 0;
          setSpendingBefore(totalSpent);
          console.log('💰 Spending before payment set to:', totalSpent);
        } catch (err) {
          console.error('❌ Error fetching spending before:', err);
          setSpendingBefore(null);
        }
      }
    }
    fetchSpendingBefore();
    // Reset polling state when entering step 3
    setSpendingAfter(null);
    setIsPolling(false);
    setPollingError(null);
  }, [currentStep, selectedPaymentMethod, customer?.id]);

  // Poll for spending after payment
  const startSpendingPolling = () => {
    if (!customer?.id || spendingBefore === null) {
      console.log('❌ Cannot start polling:', { customerId: customer?.id, spendingBefore });
      return;
    }
    setIsPolling(true);
    setPollingError(null);
    console.log('🔄 Starting payment polling with spendingBefore:', spendingBefore);
    
    const poll = async () => {
      try {
        const res = await fetch(`${WEBHOOK_BASE_URL}/customer/${customer.id}/spending`);
        const data = await res.json();
        const after = Number(data.totalSpent) || 0;
        setSpendingAfter(after);
        
        console.log('📊 Payment check:', {
          spendingBefore,
          spendingAfter: after,
          difference: after - spendingBefore,
          // required: cartState.totalUSDC,
          required: cart?.total,
          // isEnough: after - spendingBefore >= cartState.totalUSDC
          isEnough: after - spendingBefore >= (cart?.total === undefined ? 0 : cart?.total)
        });
        
        // If enough spent, proceed with purchase
        // if (after - spendingBefore >= cartState.totalUSDC) {
        if (after - spendingBefore >= (cart?.total === undefined ? 0 : cart?.total)) {
          console.log('✅ Payment detected! Proceeding with purchase...');
          setIsPolling(false);
          setPaymentStatus('confirmed');
          const newOrderId = orderId || generateOrderId();
          if (!orderId) setOrderId(newOrderId);
          await handlePaymentConfirmation(newOrderId);
        } else if (isPolling) {
          console.log('⏳ Payment not detected yet, polling again in 5s...');
          setTimeout(poll, 5000); // poll every 5s
        }
      } catch (err) {
        console.error('❌ Polling error:', err);
        setPollingError('Error checking payment status.');
        setIsPolling(false);
      }
    };
    poll();
  };

  const handleCreatePayment = async () => {
    setIsProcessing(true)
    
    try {
      const newOrderId = generateOrderId()
      setOrderId(newOrderId)
      
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const mockPaymentData: PaymentData = {
        id: 'payment_' + Date.now(),
        // amount: cartState.totalAmount,
        amount: cart?.total!,
        // cryptoAmount: cartState.totalUSDC,
        cryptoAmount: cart?.total!.toFixed(2),
        cryptoCurrency: 'USDC',
        address: 'UQD1234567890ABCDEF1234567890ABCDEF1234567890',
        qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
        // paymentUrl: `usdc:UQD1234567890ABCDEF1234567890ABCDEF1234567890?amount=${cartState.totalUSDC}`,
        paymentUrl: `usdc:UQD1234567890ABCDEF1234567890ABCDEF1234567890?amount=${cart?.total}`,
        network: 'TON'
      }
      
      setPaymentData(mockPaymentData)
      setCurrentStep(3)
    } catch (error) {
      console.error('Payment creation failed:', error)
    } finally {
      setIsProcessing(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const handlePaymentConfirmation = async (providedOrderId?: string) => {
    console.log('🚀 handlePaymentConfirmation called with providedOrderId:', providedOrderId);
    console.log('📧 customerEmail:', customerEmail);
    console.log('👤 customer?.email:', customer?.email);
    console.log('🆔 orderId:', orderId);
    console.log('🛒 cartState.items:', cart?.items);
    setIsProcessing(true)
    setDeliveryError('')
    
    try {
      console.log('⏳ Waiting 2 seconds...');
      await new Promise(resolve => setTimeout(resolve, 2000))

      if(!cart?.items) return ""
      
      const orderProducts: OrderProduct[] = cart?.items.map(item => ({
        productId: item.id,
        // external_id: item.externalid || item.id,
        external_id: item.id,
        quantity: item.quantity,
        price_cents: Math.round(item.unit_price * 100),
        productVariant: 'default',
        name: item.title,
        platform: item.platform || 'Unknown'
      }))

      console.log('📦 Order products:', orderProducts);

      const finalEmail = customerEmail || customer?.email || ''
      console.log('📧 Final email:', finalEmail);
      
      if (!finalEmail || !finalEmail.includes('@')) {
        console.error('❌ Invalid email:', finalEmail);
        setDeliveryError('Please enter a valid email address for gift card delivery')
        return
      }

      // Use provided orderId or fall back to state orderId
      const currentOrderId = providedOrderId || orderId
      console.log('🆔 Current order ID:', currentOrderId);
      
      if (!currentOrderId) {
        console.error('❌ No order ID available');
        setDeliveryError('Order ID is missing. Please try again.')
        return
      }

      // Determine payment method and create payment data
      let paymentMethod: 'crypto' | 'sepa' | 'virtual_card' = 'crypto'
      let paymentDataToSend: any = {}

      if (paymentData?.network === 'SEPA') {
        paymentMethod = 'sepa'
        paymentDataToSend = {
          sepaTransferId: paymentData.id,
          iban: paymentData.address,
          amount: paymentData.amount,
          currency: 'EUR'
        }
      } else if (paymentData?.network === 'Virtual Card') {
        paymentMethod = 'virtual_card'
        paymentDataToSend = {
          cardId: paymentData.id,
          cardNumber: paymentData.address,
          amount: paymentData.amount,
          currency: 'EUR'
        }
      } else {
        paymentDataToSend = {
          cryptoAddress: paymentData?.address || usdcAddress,
          // amount: paymentData?.cryptoAmount || cartState.totalUSDC,
          amount: paymentData?.cryptoAmount || cart.total,
          currency: paymentData?.cryptoCurrency || 'USDC'
        }
      }

      console.log('💳 Payment data:', { paymentMethod, paymentDataToSend });

      const orderData: OrderRegistrationData = {
        orderId: currentOrderId,
        customer: {
          id: customer?.id,
          email: finalEmail,
          first_name: customer?.first_name ?? undefined,
          last_name: customer?.last_name ?? undefined,
          phone: customer?.phone ?? undefined
        },
        products: orderProducts,
        // totalAmount: cartState.totalAmount,
        totalAmount: cart?.total,
        // cryptoAmount: cartState.totalUSDC,
        cryptoAmount: cart.total,
        cryptoCurrency: 'USDC',
        paymentIntentId: paymentData?.id,
        paymentMethod: paymentMethod,
        paymentData: paymentDataToSend
      }

      console.log('📋 Complete order data:', orderData);
      console.log('🌐 Calling registerOrderWithBackend...');

      const deliveredOrder = await registerOrderWithBackend(orderData)
      
      console.log('📨 Backend response:', deliveredOrder);
      
       if (deliveredOrder.success && deliveredOrder.keys) {
        console.log('✅ Order successful! Processing keys...');
        // Use giftCardKeys if available (new enhanced format), otherwise fall back to keys
        const keysToUse = deliveredOrder.giftCardKeys || deliveredOrder.keys || []
        
        console.log('🔑 Frontend: Processing delivered keys:', {
          hasGiftCardKeys: !!deliveredOrder.giftCardKeys,
          hasKeys: !!deliveredOrder.keys,
          keysToUse: keysToUse,
          keysCount: keysToUse.length
        });
        
        setDeliveredKeys(
          keysToUse.map((keyObj: any, index: number) => {
            // Handle both new enhanced format and legacy string format
            if (typeof keyObj === 'string') {
              // Legacy format - just a code string
              console.log(`🔑 Frontend: Processing legacy key ${index + 1}:`, keyObj);
              return {
                code: keyObj,
                productId: 'unknown',
                productName: 'Gift Card'
              }
            } else {
              // New enhanced format - object with product info
              console.log(`🔑 Frontend: Processing enhanced key ${index + 1}:`, keyObj);
              return {
                code: keyObj.code || keyObj,
                productId: keyObj.productId || 'unknown',
                productName: keyObj.productName || keyObj.name || 'Gift Card'
              }
            }
          })
        )
        
        // Set email delivery status and messages from backend response
        setEmailSent(deliveredOrder.emailSent || false)
        setEmailError(deliveredOrder.emailError || null)
        setInvoiceUrl(deliveredOrder.invoiceUrl || null)
        setDeliveryMessage(
          deliveredOrder.deliveryMessage || 
          deliveredOrder.message || 
          'Gift card purchase completed successfully'
        )
        
        setPaymentStatus('confirmed')
        setCurrentStep(4)
        setPurchaseCompleted(true)
        console.log('🎉 Purchase completed successfully!');
      } else {
        console.error('❌ Order failed:', deliveredOrder.error);
        setDeliveryError(deliveredOrder.error || 'Failed to deliver gift cards')
      }
    } catch (error) {
      console.error('💥 Payment confirmation failed:', error)
      setDeliveryError('Payment confirmation failed. Please try again.')
    } finally {
      setIsProcessing(false)
    }
  }

  const simulatePaymentCheck = async () => {
    setPaymentStatus('confirmed');
    const newOrderId = orderId || generateOrderId();
    if (!orderId) setOrderId(newOrderId);
    await handlePaymentConfirmation(newOrderId);
  }

  const handleSepaPayment = async () => {
    setIsProcessing(true)
    setDeliveryError('')
    
    try {
      // Validate form data
      if (!sepaFormData.firstName || !sepaFormData.lastName || !sepaFormData.iban) {
        setDeliveryError('Please fill in all SEPA transfer details')
        return
      }

      // Get user info for P100 API
      const externalUserId = customer?.id
      if (!externalUserId) throw new Error('User ID not found')

      // Generate order ID if not already set
      let currentOrderId = orderId
      if (!currentOrderId) {
        currentOrderId = generateOrderId()
        setOrderId(currentOrderId)
      }

      console.log('🏦 Creating P100 SEPA transfer:', {
        sourceExternalUserId: externalUserId,
        amount: cart?.total,
        receiverFirstName: sepaFormData.firstName,
        receiverLastName: sepaFormData.lastName,
        destinationIban: sepaFormData.iban
      });

      // Create SEPA transfer using P100 API
      const sepaResponse = await fetch('/api/p100-sepa-transfer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sourceExternalUserId: externalUserId,
          currency: 'eur',
          amount: cart?.total,
          receiverFirstName: sepaFormData.firstName,
          receiverLastName: sepaFormData.lastName,
          receiverType: 'NATURAL',
          destinationIban: sepaFormData.iban,
          transferTitle: 'Gift Card Purchase'
        }),
      })

      if (!sepaResponse.ok) {
        const errorData = await sepaResponse.json().catch(() => ({}))
        console.error('P100 SEPA transfer failed:', errorData)
        throw new Error(errorData.error || errorData.details || 'SEPA transfer creation failed')
      }

      const sepaTransferData = await sepaResponse.json()
      console.log('✅ P100 SEPA transfer created:', sepaTransferData)
      
      // Store payment data
      setPaymentData({
        id: sepaTransferData.transferId,
        amount: cart?.total!,
        cryptoAmount: cart?.total!,
        cryptoCurrency: 'USDC',
        address: sepaFormData.iban,
        qrCode: '',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        paymentUrl: '',
        network: 'SEPA'
      })
      
      // Set status to processing (SEPA transfers take time)
      setPaymentStatus('pending')
      
      // Move to next step to show payment confirmation
      setCurrentStep(4)
      setDeliveryMessage('SEPA transfer initiated successfully. Your gift cards will be delivered once the transfer is completed (usually 1-2 business days).')
      
    } catch (error) {
      console.error('SEPA payment failed:', error)
      setDeliveryError(error instanceof Error ? error.message : 'SEPA transfer failed. Please try again.')
      setPaymentStatus('failed')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleVirtualCardPayment = async () => {
    setIsProcessing(true)
    setDeliveryError('')
    
    try {
      // Validate form data
      if (!virtualCardFormData.cardLabel || !virtualCardFormData.pin) {
        setDeliveryError('Please fill in all virtual card details')
        return
      }

      if (virtualCardFormData.pin.length !== 4) {
        setDeliveryError('PIN must be 4 digits')
        return
      }

      // Get user info for P100 API
      const externalUserId = customer?.id
      if (!externalUserId) throw new Error('User ID not found')

      // Generate order ID if not already set
      let currentOrderId = orderId
      if (!currentOrderId) {
        currentOrderId = generateOrderId()
        setOrderId(currentOrderId)
      }

      console.log('💳 Creating P100 virtual card:', {
        externalUserId: externalUserId,
        label: virtualCardFormData.cardLabel,
        amount: cart?.total
      });

      // Create virtual card using P100 API
      const cardResponse = await fetch('/api/p100-virtual-card', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          externalUserId: externalUserId,
          label: virtualCardFormData.cardLabel,
          pin: virtualCardFormData.pin
        }),
      })

      if (!cardResponse.ok) {
        const errorData = await cardResponse.json().catch(() => ({}))
        console.error('P100 virtual card creation failed:', errorData)
        throw new Error(errorData.error || errorData.details || 'Virtual card creation failed')
      }

      const virtualCardData = await cardResponse.json()
      console.log('✅ P100 virtual card created:', virtualCardData)
      
      // Store payment data
      setPaymentData({
        id: virtualCardData.cardId,
        amount: cart?.total!,
        cryptoAmount: cart?.total!,
        cryptoCurrency: 'USDC',
        address: `**** **** **** ${virtualCardData.cardNumber.slice(-4)}`,
        qrCode: '',
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year
        paymentUrl: '',
        network: 'Virtual Card'
      })
      
      // Set payment as confirmed (virtual card creation = payment method ready)
      setPaymentStatus('confirmed')
      await handlePaymentConfirmation(currentOrderId)
    } catch (error) {
      console.error('Virtual card payment failed:', error)
      setDeliveryError(error instanceof Error ? error.message : 'Virtual card creation failed. Please try again.')
      setPaymentStatus('failed')
    } finally {
      setIsProcessing(false)
    }
  }

  if ((cart?.items === undefined ? 0 : cart?.items.length) === 0 && !purchaseCompleted) {
    return (
      <ProtectedPage redirectTo="/auth?redirect=/checkout">
      <div className="min-h-screen bg-gradient-to-br from-gaming-dark via-gaming-purple to-gaming-dark">
        <Navigation />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <ShoppingCart className="w-16 h-16 mx-auto mb-4 text-gaming-neon" />
            <h2 className="text-2xl font-gaming font-bold text-white mb-2">Cart is Empty</h2>
            <p className="text-gray-400 mb-4">Redirecting to gift cards...</p>
            <Spinner className="w-8 h-8 mx-auto" />
          </div>
        </div>
        <Footer />
      </div>
      </ProtectedPage>
    )
  }

  return (
    <ProtectedPage redirectTo="/auth?redirect=/checkout">
    <div className="min-h-screen bg-gradient-to-br from-gaming-dark via-gaming-purple to-gaming-dark">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8 mt-16">
        {/* Progress Steps */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                  step.completed 
                    ? 'bg-gaming-neon border-gaming-neon text-gaming-dark' 
                    : step.active 
                    ? 'bg-gaming-gold border-gaming-gold text-gaming-dark' 
                    : 'border-gray-600 text-gray-400'
                }`}>
                  {step.completed ? (
                    <Check className="w-6 h-6" />
                  ) : (
                    <span className="font-bold">{step.id}</span>
                  )}
                </div>
                <div className="ml-4">
                  <h3 className={`font-semibold transition-colors duration-300 ${
                    step.active ? 'text-gaming-gold' : step.completed ? 'text-gaming-neon' : 'text-gray-400'
                  }`}>
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-500">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-4 transition-all duration-300 ${
                    step.completed ? 'bg-gaming-neon' : 'bg-gray-600'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          {/* Step 1: Order Review */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="gaming-card max-w-4xl mx-auto"
            >
              <h2 className="text-2xl font-gaming font-bold text-white mb-6">Order Review</h2>
              
              <div className="space-y-4 mb-6">
                {
                cart?.items === undefined ?  null:
                cart?.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-gaming-cyan/30 bg-gaming-dark/50">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gaming-gold/20 rounded-lg flex items-center justify-center">
                        <Gift className="w-6 h-6 text-gaming-gold" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{item?.title}</h3>
                        <p className="text-sm text-gray-400">{item?.platform}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gaming-neon">${item.unit_price.toFixed(2)}</div>
                      <div className="text-sm text-gray-400">Qty: {item.quantity}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-gaming-cyan/30 pt-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">Subtotal:</span>
                  <span className="text-white">${cart?.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-400">Crypto Amount:</span>
                  <span className="text-gaming-gold">{cart?.total.toFixed(6)} USDC</span>
                </div>
                <div className="flex justify-between items-center text-lg font-bold">
                  <span className="text-white">Total:</span>
                  <span className="text-gaming-neon">{cart?.total.toFixed(6)} USDC</span>
                </div>
              </div>

              {/* Email Input for Guest Users */}
              {!customer?.email && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address (for gift card delivery)
                  </label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg border border-gaming-cyan/30 bg-gaming-dark/50 text-white placeholder-gray-400 focus:border-gaming-neon focus:outline-none transition-colors"
                    placeholder="your@email.com"
                    required
                  />
                  {!customerEmail && (
                    <p className="text-sm text-red-400 mt-1">
                      Email is required for gift card delivery
                    </p>
                  )}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  onClick={() => setCurrentStep(2)}
                  disabled={!customer?.email && !customerEmail}
                  className="btn-neon disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue to Payment
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Payment Method Selection */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="gaming-card max-w-4xl mx-auto"
            >
              <h2 className="text-2xl font-gaming font-bold text-white mb-6">Choose Payment Method</h2>
              
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                {/* Crypto Payment Option */}
                <div 
                  className={`p-6 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                    selectedPaymentMethod === 'crypto' 
                      ? 'border-gaming-neon bg-gaming-neon/10' 
                      : 'border-gray-600 bg-gaming-dark/50 hover:border-gaming-cyan/50'
                  }`}
                  onClick={() => setSelectedPaymentMethod('crypto')}
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-gaming-gold/20 rounded-lg flex items-center justify-center">
                      <Bitcoin className="w-6 h-6 text-gaming-gold" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Cryptocurrency</h3>
                      <p className="text-sm text-gray-400">USDC on TON Network</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-gaming-neon" />
                      <span className="text-gray-300">Instant confirmation</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-gaming-neon" />
                      <span className="text-gray-300">Secure blockchain</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Gift className="w-4 h-4 text-gaming-neon" />
                      <span className="text-gray-300">Instant delivery</span>
                    </div>
                  </div>
                </div>

                {/* SEPA Transfer Option */}
                <div 
                  className={`p-6 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                    selectedPaymentMethod === 'sepa' 
                      ? 'border-gaming-neon bg-gaming-neon/10' 
                      : 'border-gray-600 bg-gaming-dark/50 hover:border-gaming-cyan/50'
                  }`}
                  onClick={() => setSelectedPaymentMethod('sepa')}
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <Wallet className="w-6 h-6 text-green-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">SEPA Transfer</h3>
                      <p className="text-sm text-gray-400">Bank Transfer (EUR)</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Clock className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300">1-2 business days</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300">Secure banking</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Gift className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300">Instant delivery</span>
                    </div>
                  </div>
                </div>

                {/* Virtual Card Option */}
                <div 
                  className={`p-6 rounded-lg border-2 cursor-pointer transition-all duration-300 ${
                    selectedPaymentMethod === 'virtual_card' 
                      ? 'border-gaming-neon bg-gaming-neon/10' 
                      : 'border-gray-600 bg-gaming-dark/50 hover:border-gaming-cyan/50'
                  }`}
                  onClick={() => setSelectedPaymentMethod('virtual_card')}
                >
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="w-12 h-12 bg-blue-500/20 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white">Virtual Card</h3>
                      <p className="text-sm text-gray-400">Instant Virtual Card</p>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-blue-400" />
                      <span className="text-gray-300">Instant creation</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Shield className="w-4 h-4 text-blue-400" />
                      <span className="text-gray-300">Secure & flexible</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Gift className="w-4 h-4 text-blue-400" />
                      <span className="text-gray-300">Instant delivery</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-between">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="btn-secondary"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="btn-neon"
                >
                  Continue
                  <ArrowRight className="w-5 h-5 ml-2" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Payment Details */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="gaming-card max-w-4xl mx-auto"
            >
              {selectedPaymentMethod === 'crypto' ? (
                // Crypto Payment Interface
                <div>
                  <h2 className="text-2xl font-gaming font-bold text-white mb-6">Crypto Payment</h2>
                  {balanceLoading ? (
                    <div className="text-center py-12">
                      <Spinner className="w-8 h-8 mx-auto mb-4" />
                      <div className="text-gray-400">Loading your USDC balance...</div>
                    </div>
                  ) : balanceError ? (
                    <div className="text-center py-12 text-red-400">{balanceError}</div>
                  ) : !usdcAddress ? (
                    <div className="text-center py-12 text-yellow-400">No USDC wallet found for your account.</div>
                  ) : (
                    <div className="space-y-6">
                      {/* Payment Address */}
                      <div className="p-4 rounded-lg border border-gaming-cyan/30 bg-gaming-dark/50">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-gray-400">USDC Wallet Address:</span>
                          <button
                            onClick={() => copyToClipboard(usdcAddress)}
                            className="text-gaming-neon hover:text-gaming-gold transition-colors"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="font-mono text-sm text-white break-all">
                          {usdcAddress}
                        </div>
                      </div>
                      {/* Payment Details */}
                      <div className="grid md:grid-cols-2 gap-4">
                        <div className="p-4 rounded-lg border border-gaming-cyan/30 bg-gaming-dark/50">
                          <div className="text-gray-400 text-sm mb-1">Your USDC Balance</div>
                          <div className="font-mono text-lg text-gaming-neon">
                            {usdcBalance !== null ? `${usdcBalance} USDC` : 'N/A'}
                          </div>
                        </div>
                        <div className="p-4 rounded-lg border border-gaming-cyan/30 bg-gaming-dark/50">
                          <div className="text-gray-400 text-sm mb-1">Network</div>
                          <div className="font-semibold text-white">USDC</div>
                        </div>
                      </div>
                      {/* Payment Instructions */}
                      <div className="p-4 rounded-lg border border-gaming-gold/30 bg-gaming-gold/10">
                        <div className="flex items-start space-x-3">
                          <Clock className="w-6 h-6 text-gaming-gold mt-1" />
                          <div>
                            <div className="font-semibold text-gaming-gold mb-2">Payment Instructions</div>
                            <ol className="text-sm space-y-1 text-gray-300">
                              <li>1. Send the required USDC amount to the address above</li>
                              <li>2. Wait for blockchain confirmation (usually 1-2 minutes)</li>
                              <li>3. Your gift card codes will be delivered automatically</li>
                              <li>4. Keep this page open to receive your codes</li>
                            </ol>
                          </div>
                        </div>
                      </div>
                      {/* Action Buttons */}
                      <div className="flex justify-between">
                        <button
                          onClick={() => setCurrentStep(2)}
                          className="btn-secondary"
                        >
                          <ArrowLeft className="w-5 h-5 mr-2" />
                          Back
                        </button>
                        <div className="flex space-x-2">
                          <button
                            onClick={startSpendingPolling}
                            disabled={isPolling || isProcessing || paymentStatus === 'confirmed'}
                            className="btn-neon"
                          >
                            {isPolling ? (
                              <>
                                <Spinner className="w-5 h-5 mr-2" />
                                Waiting for Payment...
                              </>
                            ) : (
                              <>
                                Check Payment
                                <ArrowRight className="w-5 h-5 ml-2" />
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                      {isPolling && (
                        <div className="text-center text-yellow-400 mt-4">
                          Waiting for your payment to be detected on the blockchain...<br />
                          This may take a few minutes after you send your crypto.
                        </div>
                      )}
                      {pollingError && (
                        <div className="text-center text-red-400 mt-2">{pollingError}</div>
                      )}
                      {spendingAfter !== null && spendingAfter - (spendingBefore || 0) < cart?.total! && !isPolling && (
                        <div className="text-center text-yellow-400 mt-2">
                          Payment not detected yet. Please make sure you sent the correct amount.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : selectedPaymentMethod === 'sepa' ? (
                // SEPA Transfer Interface
                <div>
                  <h2 className="text-2xl font-gaming font-bold text-white mb-6">SEPA Transfer</h2>
                  
                  <div className="space-y-6">
                    {/* SEPA Transfer Form */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          First Name
                        </label>
                        <input
                          type="text"
                          value={sepaFormData.firstName}
                          onChange={(e) => setSepaFormData({ ...sepaFormData, firstName: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-gaming-cyan/30 bg-gaming-dark/50 text-white placeholder-gray-400 focus:border-gaming-neon focus:outline-none transition-colors"
                          placeholder="John"
                          required
                        />
                        {!sepaFormData.firstName && (
                          <p className="text-sm text-red-400 mt-1">First name is required</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Last Name
                        </label>
                        <input
                          type="text"
                          value={sepaFormData.lastName}
                          onChange={(e) => setSepaFormData({ ...sepaFormData, lastName: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-gaming-cyan/30 bg-gaming-dark/50 text-white placeholder-gray-400 focus:border-gaming-neon focus:outline-none transition-colors"
                          placeholder="Doe"
                          required
                        />
                        {!sepaFormData.lastName && (
                          <p className="text-sm text-red-400 mt-1">Last name is required</p>
                        )}
                      </div>
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          IBAN Number
                        </label>
                        <input
                          type="text"
                          value={sepaFormData.iban}
                          onChange={(e) => setSepaFormData({ ...sepaFormData, iban: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-gaming-cyan/30 bg-gaming-dark/50 text-white placeholder-gray-400 focus:border-gaming-neon focus:outline-none transition-colors"
                          placeholder="LT601010012345678901"
                          required
                        />
                        {!sepaFormData.iban && (
                          <p className="text-sm text-red-400 mt-1">IBAN is required</p>
                        )}
                      </div>
                    </div>

                    {/* Transfer Summary */}
                    <div className="p-4 rounded-lg border border-green-500/30 bg-green-500/10">
                      <div className="flex items-center space-x-3 mb-4">
                        <Wallet className="w-6 h-6 text-green-400" />
                        <div>
                          <div className="font-semibold text-green-400">Transfer Summary</div>
                          <div className="text-sm text-green-300">SEPA transfer to your bank account</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Amount:</span>
                          <span className="text-white font-semibold">€{(cart?.total! * 0.85).toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Fee:</span>
                          <span className="text-gray-300">€10.00</span>
                        </div>
                        <div className="flex justify-between border-t border-green-500/30 pt-2">
                          <span className="text-white font-semibold">Total:</span>
                          <span className="text-green-400 font-bold">€{(cart?.total * 0.85 + 10).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between">
                      <button
                        onClick={() => setCurrentStep(2)}
                        className="btn-secondary"
                      >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back
                      </button>
                      <button
                        onClick={handleSepaPayment}
                        disabled={isProcessing}
                        className="btn-neon"
                      >
                        {isProcessing ? (
                          <>
                            <Spinner className="w-5 h-5 mr-2" />
                            Processing SEPA Transfer...
                          </>
                        ) : (
                          <>
                            <Wallet className="w-5 h-5 mr-2" />
                            Create SEPA Transfer
                            <ArrowRight className="w-5 h-5 ml-2" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // Virtual Card Interface
                <div>
                  <h2 className="text-2xl font-gaming font-bold text-white mb-6">Virtual Card</h2>
                  
                  <div className="space-y-6">
                    {/* Virtual Card Form */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Card Label
                        </label>
                        <input
                          type="text"
                          value={virtualCardFormData.cardLabel}
                          onChange={(e) => setVirtualCardFormData({ ...virtualCardFormData, cardLabel: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg border border-gaming-cyan/30 bg-gaming-dark/50 text-white placeholder-gray-400 focus:border-gaming-neon focus:outline-none transition-colors"
                          placeholder="Gift Card Purchase"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          PIN (4 digits)
                        </label>
                        <input
                          type="password"
                          value={virtualCardFormData.pin}
                          onChange={(e) => setVirtualCardFormData({ ...virtualCardFormData, pin: e.target.value })}
                          maxLength={4}
                          className="w-full px-4 py-3 rounded-lg border border-gaming-cyan/30 bg-gaming-dark/50 text-white placeholder-gray-400 focus:border-gaming-neon focus:outline-none transition-colors"
                          placeholder="1234"
                        />
                      </div>
                    </div>

                    {/* Card Preview */}
                    <div className="p-6 rounded-lg border border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
                      <div className="flex items-center space-x-3 mb-4">
                        <CreditCard className="w-6 h-6 text-blue-400" />
                        <div>
                          <div className="font-semibold text-blue-400">Virtual Card Preview</div>
                          <div className="text-sm text-blue-300">Your instant virtual card</div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-300">Card Type:</span>
                          <span className="text-white">Virtual Card</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Currency:</span>
                          <span className="text-white">EUR</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-300">Monthly Fee:</span>
                          <span className="text-white">€0.25</span>
                        </div>
                        <div className="flex justify-between border-t border-blue-500/30 pt-2">
                          <span className="text-white font-semibold">Purchase Amount:</span>
                          <span className="text-blue-400 font-bold">€{cart?.total}</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-between">
                      <button
                        onClick={() => setCurrentStep(2)}
                        className="btn-secondary"
                      >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        Back
                      </button>
                      <button
                        onClick={handleVirtualCardPayment}
                        disabled={isProcessing}
                        className="btn-neon"
                      >
                        {isProcessing ? (
                          <>
                            <Spinner className="w-5 h-5 mr-2" />
                            Creating Virtual Card...
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-5 h-5 mr-2" />
                            Create Virtual Card
                            <ArrowRight className="w-5 h-5 ml-2" />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Step 4: Delivery */}
          {currentStep === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="gaming-card max-w-4xl mx-auto"
            >
              <h2 className="text-2xl font-gaming font-bold text-white mb-6">Gift Card Delivery</h2>
              
              {deliveryError ? (
                <div className="p-6 rounded-lg border border-red-500/30 bg-red-500/10">
                  <div className="flex items-center space-x-3">
                    <AlertCircle className="w-6 h-6 text-red-400" />
                    <div>
                      <div className="font-semibold text-red-400">Delivery Error</div>
                      <div className="text-sm text-red-300">{deliveryError}</div>
                    </div>
                  </div>
                </div>
              ) : paymentData?.network === 'SEPA' && paymentStatus === 'pending' ? (
                <div className="space-y-6">
                  {/* SEPA Transfer Processing */}
                  <div className="p-6 rounded-lg border border-yellow-500/30 bg-yellow-500/10">
                    <div className="flex items-center space-x-3">
                      <Clock className="w-6 h-6 text-yellow-400" />
                      <div>
                        <div className="font-semibold text-yellow-400">🏦 SEPA Transfer Initiated</div>
                        <div className="text-sm text-yellow-300">
                          {deliveryMessage || 'Your SEPA transfer has been created successfully. Gift cards will be delivered automatically once the transfer completes (usually 1-2 business days).'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Transfer Details */}
                  <div className="p-4 rounded-lg border border-gaming-cyan/30 bg-gaming-dark/50">
                    <h4 className="font-semibold text-white mb-3">Transfer Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Transfer ID:</span>
                        <span className="text-white">{paymentData.id}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Amount:</span>
                        <span className="text-white">€{cart?.total.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Destination IBAN:</span>
                        <span className="text-white">{paymentData.address}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Status:</span>
                        <span className="text-yellow-400">Processing</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Email:</span>
                        <span className="text-white">{customerEmail}</span>
                      </div>
                    </div>
                  </div>

                  {/* Information */}
                  <div className="p-4 rounded-lg border border-blue-500/30 bg-blue-500/10">
                    <h4 className="font-semibold text-blue-400 mb-3">📧 What happens next?</h4>
                    <ul className="text-sm text-blue-300 space-y-1">
                      <li>• Your SEPA transfer is being processed by the banking system</li>
                      <li>• You will receive an email confirmation when the transfer completes</li>
                      <li>• Gift card codes will be automatically delivered to your email</li>
                      <li>• Processing time: 1-2 business days</li>
                    </ul>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-between">
                    <button
                      onClick={() => {
                        clearCart()
                        router.push('/gift-cards')
                      }}
                      className="btn-secondary"
                    >
                      Continue Shopping
                    </button>
                    <button
                      onClick={() => {
                        clearCart()
                        router.push('/history')
                      }}
                      className="btn-neon"
                    >
                      View Order History
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </button>
                  </div>
                </div>
              ) : deliveredKeys.length > 0 ? (
                <div className="space-y-6">
                  {/* Success Message */}
                  <div className="p-6 rounded-lg border border-green-500/30 bg-green-500/10">
                    <div className="flex items-center space-x-3">
                      <Check className="w-6 h-6 text-green-400" />
                      <div>
                        <div className="font-semibold text-green-400">Payment Successful!</div>
                        <div className="text-sm text-green-300">
                          {deliveryMessage || 'Your gift card codes have been generated and are ready for use.'}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Email Delivery Status */}
                  {emailSent ? (
                    <div className="p-6 rounded-lg border border-blue-500/30 bg-blue-500/10">
                      <div className="flex items-center space-x-3">
                        <Mail className="w-6 h-6 text-blue-400" />
                        <div>
                          <div className="font-semibold text-blue-400">📧 Email Sent Successfully!</div>
                          <div className="text-sm text-blue-300">
                            Gift card codes and invoice have been sent to {customerEmail}. 
                            Please check your inbox (and spam folder if needed).
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : emailError ? (
                    <div className="p-6 rounded-lg border border-yellow-500/30 bg-yellow-500/10">
                      <div className="flex items-center space-x-3">
                        <AlertTriangle className="w-6 h-6 text-yellow-400" />
                        <div>
                          <div className="font-semibold text-yellow-400">⚠️ Email Delivery Failed</div>
                          <div className="text-sm text-yellow-300">
                            We couldn't send your gift cards via email. Please save the codes below and contact support.
                          </div>
                          {emailError && (
                            <div className="text-xs text-yellow-200 mt-1">
                              Error: {emailError}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 rounded-lg border border-gray-500/30 bg-gray-500/10">
                      <div className="flex items-center space-x-3">
                        <Clock className="w-6 h-6 text-gray-400" />
                        <div>
                          <div className="font-semibold text-gray-400">📧 Email Status Unknown</div>
                          <div className="text-sm text-gray-300">
                            Please save the codes below and check your email at {customerEmail}.
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Gift Card Codes */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-white">Your Gift Card Codes</h3>
                      <button
                        onClick={() => setShowKeys(!showKeys)}
                        className="flex items-center space-x-2 text-gaming-neon hover:text-gaming-gold transition-colors"
                      >
                        {showKeys ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        <span>{showKeys ? 'Hide' : 'Show'} Codes</span>
                      </button>
                    </div>
                    
                    <div className="space-y-3">
                      {deliveredKeys.map((key, index) => (
                        <div key={index} className="p-4 rounded-lg border border-gaming-cyan/30 bg-gaming-dark/50">
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-semibold text-white">{key.productName}</div>
                              <div className="text-sm text-gray-400">{key.productId}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-mono text-sm text-gaming-neon">
                                {showKeys ? key.code : '••••••••••••••••'}
                              </div>
                              <button
                                onClick={() => copyToClipboard(key.code)}
                                className="text-xs text-gaming-cyan hover:text-gaming-gold transition-colors"
                              >
                                Copy
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Summary */}
                  <div className="p-4 rounded-lg border border-gaming-cyan/30 bg-gaming-dark/50">
                    <h4 className="font-semibold text-white mb-3">Order Summary</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Order ID:</span>
                        <span className="text-white">{orderId}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Paid:</span>
                        <span className="text-gaming-neon">{cart?.total.toFixed(6)} USDC</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Email:</span>
                        <span className="text-white">{customerEmail}</span>
                      </div>
                    </div>
                  </div>

                  {/* Invoice Download Button */}
                  {invoiceUrl && (
                    <div className="p-4 rounded-lg border border-purple-500/30 bg-purple-500/10">
                      <h4 className="font-semibold text-white mb-3">Invoice & Receipt</h4>
                      <p className="text-sm text-gray-300 mb-4">
                        Download your invoice for accounting and records.
                      </p>
                      <a
                        href={`${process.env.NEXT_PUBLIC_MEDUSA_BACKEND_URL || 'http://localhost:9000'}${invoiceUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-neon inline-flex items-center space-x-2"
                        download
                      >
                        <Download className="w-5 h-5" />
                        <span>Download Invoice (PDF)</span>
                      </a>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-between">
                    <button
                      onClick={() => {
                        clearCart()
                        router.push('/gift-cards')
                      }}
                      className="btn-secondary"
                    >
                      Continue Shopping
                    </button>
                    <button
                      onClick={() => {
                        clearCart()
                        router.push('/history')
                      }}
                      className="btn-neon"
                    >
                      View Order History
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Spinner className="w-16 h-16 mx-auto mb-4 text-gaming-neon" />
                  <h3 className="text-xl font-semibold text-white mb-2">Processing Delivery</h3>
                  <p className="text-gray-400">Please wait while we process your gift card codes...</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      <Footer />
    </div>
    </ProtectedPage>
  )
} 
