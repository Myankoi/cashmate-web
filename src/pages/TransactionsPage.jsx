import { useCallback, useEffect, useMemo, useState } from 'react'
import { FilterX, Plus, ReceiptText } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getCategories } from '../api/categories.js'
import { getStaff } from '../api/staff.js'
import {
  getTransactions,
  restoreTransaction,
  updateTransaction,
  voidTransaction,
} from '../api/transactions.js'
import { getWallets } from '../api/wallets.js'
import PageHeader from '../components/PageHeader.jsx'
import TransactionForm from '../components/TransactionForm.jsx'
import TransactionRow from '../components/TransactionRow.jsx'
import {
  Button,
  ConfirmDialog,
  EmptyState,
  ErrorState,
  LoadingState,
  Modal,
  Pagination,
  SelectInput,
  TextInput,
} from '../components/ui.jsx'
import { useAuth } from '../hooks/useAuth.js'
import { useToast } from '../hooks/useToast.js'
import { formatDate, formatIDR, isDeleted } from '../utils/formatters.js'

const initialFilters = {
  status: 'active',
  type: '',
  wallet_id: '',
  category_id: '',
  creator_id: '',
  from_date: '',
  to_date: '',
  page: 1,
}

export default function TransactionsPage() {
  const { user } = useAuth()
  const { showToast } = useToast()
  const [filters, setFilters] = useState(initialFilters)
  const [transactions, setTransactions] = useState([])
  const [meta, setMeta] = useState(null)
  const [wallets, setWallets] = useState([])
  const [categories, setCategories] = useState([])
  const [staff, setStaff] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editTarget, setEditTarget] = useState(null)
  const [action, setAction] = useState(null)
  const [actionLoading, setActionLoading] = useState(false)

  const loadOptions = useCallback(async () => {
    try {
      const [walletData, categoryData, staffData] = await Promise.all([
        getWallets('all'),
        getCategories('all'),
        getStaff('all'),
      ])
      setWallets(walletData)
      setCategories(categoryData)
      setStaff(staffData)
    } catch (requestError) {
      setError(requestError.message)
    }
  }, [])

  const loadTransactions = useCallback(async () => {
    if (filters.from_date && filters.to_date && filters.from_date > filters.to_date) {
      setError('Tanggal awal tidak boleh lebih besar dari tanggal akhir.')
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')
    try {
      const result = await getTransactions({
        ...filters,
        type: filters.type || undefined,
        wallet_id: filters.wallet_id || undefined,
        category_id: filters.category_id || undefined,
        creator_id: filters.creator_id || undefined,
        from_date: filters.from_date || undefined,
        to_date: filters.to_date || undefined,
        per_page: 15,
      })
      setTransactions(result.items)
      setMeta(result.meta)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    const timeout = window.setTimeout(loadOptions, 0)
    return () => window.clearTimeout(timeout)
  }, [loadOptions])

  useEffect(() => {
    const timeout = window.setTimeout(loadTransactions, 0)
    return () => window.clearTimeout(timeout)
  }, [loadTransactions])

  const activeWallets = useMemo(() => wallets.filter((wallet) => !isDeleted(wallet.deleted_at)), [wallets])
  const activeCategories = useMemo(
    () => categories.filter((category) => !isDeleted(category.deleted_at)),
    [categories],
  )

  function updateFilter(name, value) {
    setFilters((current) => ({ ...current, [name]: value, page: 1 }))
  }

  async function handleEdit(payload) {
    await updateTransaction(editTarget.id, payload)
    setEditTarget(null)
    showToast('Transaksi berhasil diperbarui.')
    await loadTransactions()
    await loadOptions()
  }

  async function handleAction() {
    if (!action) return
    setActionLoading(true)
    try {
      if (action.type === 'void') {
        await voidTransaction(action.transaction.id)
        showToast('Transaksi berhasil di-void.')
      } else {
        await restoreTransaction(action.transaction.id)
        showToast('Transaksi berhasil dipulihkan.')
      }
      setAction(null)
      await loadTransactions()
      await loadOptions()
    } catch (requestError) {
      showToast(requestError.message, 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const grouped = transactions.reduce((groups, transaction) => {
    if (!groups[transaction.date]) groups[transaction.date] = []
    groups[transaction.date].push(transaction)
    return groups
  }, {})

  const hasFilters = Object.entries(filters).some(
    ([key, value]) => key !== 'page' && value && !(key === 'status' && value === 'active'),
  )

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Buku kas"
        title="Riwayat Transaksi"
        description="Pantau seluruh pemasukan dan pengeluaran yang dicatat Owner maupun Staff."
        action={
          <Link to="/transactions/new">
            <Button className="w-full sm:w-auto">
              <Plus className="h-4 w-4" /> Tambah Transaksi
            </Button>
          </Link>
        }
      />

      <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          <SelectInput value={filters.status} onChange={(event) => updateFilter('status', event.target.value)} aria-label="Status transaksi">
            <option value="active">Transaksi aktif</option>
            <option value="disabled">Transaksi void</option>
            <option value="all">Semua status</option>
          </SelectInput>
          <SelectInput value={filters.type} onChange={(event) => updateFilter('type', event.target.value)} aria-label="Jenis transaksi">
            <option value="">Semua jenis</option>
            <option value="income">Uang masuk</option>
            <option value="expense">Uang keluar</option>
          </SelectInput>
          <SelectInput value={filters.wallet_id} onChange={(event) => updateFilter('wallet_id', event.target.value)} aria-label="Dompet">
            <option value="">Semua dompet</option>
            {wallets.map((wallet) => (
              <option key={wallet.id} value={wallet.id}>{wallet.name}</option>
            ))}
          </SelectInput>
          <SelectInput value={filters.category_id} onChange={(event) => updateFilter('category_id', event.target.value)} aria-label="Kategori">
            <option value="">Semua kategori</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </SelectInput>
          <SelectInput value={filters.creator_id} onChange={(event) => updateFilter('creator_id', event.target.value)} aria-label="Pencatat">
            <option value="">Semua pencatat</option>
            <option value={user.id}>{user.name} (Owner)</option>
            {staff.map((member) => (
              <option key={member.id} value={member.id}>{member.name}</option>
            ))}
          </SelectInput>
          <TextInput type="date" value={filters.from_date} onChange={(event) => updateFilter('from_date', event.target.value)} aria-label="Tanggal awal" />
          <TextInput type="date" value={filters.to_date} onChange={(event) => updateFilter('to_date', event.target.value)} aria-label="Tanggal akhir" />
        </div>
        {hasFilters && (
          <button
            type="button"
            onClick={() => setFilters(initialFilters)}
            className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-brand-600"
          >
            <FilterX className="h-4 w-4" /> Reset filter
          </button>
        )}
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm sm:p-6">
        {loading ? (
          <LoadingState rows={6} />
        ) : error ? (
          <ErrorState message={error} onRetry={loadTransactions} />
        ) : !transactions.length ? (
          <EmptyState
            icon={ReceiptText}
            title="Tidak ada transaksi"
            description="Belum ada transaksi yang cocok dengan filter yang dipilih."
            action={
              <Link to="/transactions/new">
                <Button size="sm">Catat transaksi</Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-6">
            {Object.entries(grouped).map(([date, items]) => (
              <div key={date}>
                <div className="mb-3 flex items-center gap-3">
                  <p className="shrink-0 text-[11px] font-extrabold tracking-wide text-slate-500 uppercase">
                    {formatDate(date)}
                  </p>
                  <span className="h-px flex-1 bg-slate-100" />
                  <span className="text-[10px] font-semibold text-slate-400">{items.length} transaksi</span>
                </div>
                <div className="space-y-2">
                  {items.map((transaction) => (
                    <TransactionRow
                      key={transaction.id}
                      transaction={transaction}
                      onEdit={setEditTarget}
                      onVoid={(target) => setAction({ type: 'void', transaction: target })}
                      onRestore={(target) => setAction({ type: 'restore', transaction: target })}
                    />
                  ))}
                </div>
              </div>
            ))}
            <Pagination
              meta={meta}
              onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
            />
          </div>
        )}
      </section>

      <Modal
        open={Boolean(editTarget)}
        onClose={() => setEditTarget(null)}
        title="Edit Transaksi"
        description="Efek transaksi lama akan dibalik dan saldo dompet diperbarui otomatis oleh sistem."
        size="lg"
      >
        {editTarget && (
          <TransactionForm
            wallets={activeWallets}
            categories={activeCategories}
            initialValue={editTarget}
            onSubmit={handleEdit}
            onCancel={() => setEditTarget(null)}
            submitLabel="Simpan Perubahan"
          />
        )}
      </Modal>

      <ConfirmDialog
        open={Boolean(action)}
        onClose={() => setAction(null)}
        onConfirm={handleAction}
        loading={actionLoading}
        tone={action?.type === 'void' ? 'danger' : 'primary'}
        title={action?.type === 'void' ? 'Void transaksi ini?' : 'Pulihkan transaksi ini?'}
        description={
          action?.type === 'void'
            ? 'Transaksi akan ditandai batal dan saldo dompet disesuaikan kembali.'
            : 'Transaksi akan aktif kembali dan efeknya diterapkan ke saldo dompet.'
        }
        confirmLabel={action?.type === 'void' ? 'Ya, Void Transaksi' : 'Pulihkan Transaksi'}
      >
        {action && (
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-sm font-extrabold text-slate-800">
              {action.transaction.description || action.transaction.category?.name}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {action.transaction.type === 'income' ? '+' : '−'} {formatIDR(action.transaction.amount)} ·{' '}
              {action.transaction.wallet?.name}
            </p>
          </div>
        )}
      </ConfirmDialog>
    </div>
  )
}
