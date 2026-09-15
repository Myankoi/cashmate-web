import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, Info } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { getCategories } from '../api/categories.js'
import { createTransaction } from '../api/transactions.js'
import { getWallets } from '../api/wallets.js'
import PageHeader from '../components/PageHeader.jsx'
import TransactionForm from '../components/TransactionForm.jsx'
import { EmptyState, ErrorState, LoadingState } from '../components/ui.jsx'
import { useToast } from '../hooks/useToast.js'

export default function NewTransactionPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [wallets, setWallets] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const loadOptions = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [walletData, categoryData] = await Promise.all([
        getWallets('active'),
        getCategories('active'),
      ])
      setWallets(walletData)
      setCategories(categoryData)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timeout = window.setTimeout(loadOptions, 0)
    return () => window.clearTimeout(timeout)
  }, [loadOptions])

  async function handleSubmit(payload) {
    await createTransaction(payload)
    showToast('Transaksi berhasil dicatat.')
    navigate('/transactions')
  }

  const hasBothCategoryTypes =
    categories.some((category) => category.type === 'income') &&
    categories.some((category) => category.type === 'expense')

  return (
    <div className="space-y-6">
      <Link
        to="/transactions"
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-brand-600"
      >
        <ArrowLeft className="h-4 w-4" /> Kembali ke Riwayat
      </Link>
      <PageHeader
        eyebrow="Pencatatan kas"
        title="Tambah Transaksi"
        description="Catat pemasukan atau pengeluaran pada dompet dan kategori yang sesuai."
      />

      <section className="mx-auto max-w-3xl rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-7">
        {loading ? (
          <LoadingState rows={5} />
        ) : error ? (
          <ErrorState message={error} onRetry={loadOptions} />
        ) : !wallets.length || !hasBothCategoryTypes ? (
          <EmptyState
            icon={Info}
            title="Data transaksi belum siap"
            description="Buat minimal satu dompet serta kategori pemasukan dan pengeluaran sebelum mencatat transaksi."
          />
        ) : (
          <TransactionForm wallets={wallets} categories={categories} onSubmit={handleSubmit} />
        )}
      </section>
    </div>
  )
}
