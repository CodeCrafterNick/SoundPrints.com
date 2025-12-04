'use client'

import { useState } from 'react'
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Check,
  Home,
  Building,
  Star,
  ChevronDown,
  X
} from 'lucide-react'

const sampleAddresses = [
  {
    id: '1',
    type: 'home',
    isDefault: true,
    name: 'John Doe',
    address: '123 Main Street',
    apartment: 'Apt 4B',
    city: 'New York',
    state: 'NY',
    zip: '10001',
    country: 'United States',
    phone: '+1 (555) 123-4567'
  },
  {
    id: '2',
    type: 'work',
    isDefault: false,
    name: 'John Doe',
    address: '456 Business Ave',
    apartment: 'Suite 100',
    city: 'New York',
    state: 'NY',
    zip: '10018',
    country: 'United States',
    phone: '+1 (555) 987-6543'
  }
]

// Address Card
export function AddressCard({
  address,
  onEdit,
  onDelete,
  onSetDefault
}: {
  address: typeof sampleAddresses[0]
  onEdit?: () => void
  onDelete?: () => void
  onSetDefault?: () => void
}) {
  return (
    <div className={`bg-white rounded-2xl p-6 border-2 transition-colors ${address.isDefault ? 'border-rose-500' : 'border-gray-100 hover:border-gray-200'
      }`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${address.type === 'home' ? 'bg-rose-100' : 'bg-blue-100'
            }`}>
            {address.type === 'home' ? (
              <Home className={`h-5 w-5 ${address.type === 'home' ? 'text-rose-500' : 'text-blue-500'}`} />
            ) : (
              <Building className="h-5 w-5 text-blue-500" />
            )}
          </div>
          <div>
            <span className="font-semibold text-gray-900 capitalize">{address.type}</span>
            {address.isDefault && (
              <span className="ml-2 text-xs bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full">Default</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Edit2 className="h-4 w-4 text-gray-500" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 hover:bg-red-50 rounded-lg transition-colors"
          >
            <Trash2 className="h-4 w-4 text-red-500" />
          </button>
        </div>
      </div>

      <div className="space-y-1 text-gray-600 mb-4">
        <p className="font-medium text-gray-900">{address.name}</p>
        <p>{address.address}</p>
        {address.apartment && <p>{address.apartment}</p>}
        <p>{address.city}, {address.state} {address.zip}</p>
        <p>{address.country}</p>
        <p className="text-gray-500">{address.phone}</p>
      </div>

      {!address.isDefault && (
        <button
          onClick={onSetDefault}
          className="text-sm text-rose-500 hover:text-rose-600 font-medium flex items-center gap-1"
        >
          <Star className="h-4 w-4" />
          Set as Default
        </button>
      )}
    </div>
  )
}

// Address Form Modal
export function AddressFormModal({
  isOpen,
  onClose,
  address
}: {
  isOpen: boolean
  onClose: () => void
  address?: typeof sampleAddresses[0] | null
}) {
  const [formData, setFormData] = useState({
    type: address?.type || 'home',
    name: address?.name || '',
    address: address?.address || '',
    apartment: address?.apartment || '',
    city: address?.city || '',
    state: address?.state || '',
    zip: address?.zip || '',
    country: address?.country || 'United States',
    phone: address?.phone || '',
    isDefault: address?.isDefault || false
  })

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h3 className="text-xl font-bold text-gray-900">
            {address ? 'Edit Address' : 'Add New Address'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Address Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Address Type</label>
            <div className="flex gap-3">
              <button
                onClick={() => setFormData({ ...formData, type: 'home' })}
                className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors ${formData.type === 'home'
                    ? 'bg-rose-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                <Home className="h-5 w-5" />
                Home
              </button>
              <button
                onClick={() => setFormData({ ...formData, type: 'work' })}
                className={`flex-1 py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors ${formData.type === 'work'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                <Building className="h-5 w-5" />
                Work
              </button>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
          </div>

          {/* Street Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="123 Main Street"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
          </div>

          {/* Apartment */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Apt, Suite, etc. (optional)</label>
            <input
              type="text"
              value={formData.apartment}
              onChange={(e) => setFormData({ ...formData, apartment: e.target.value })}
              placeholder="Apt 4B"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
          </div>

          {/* City, State, ZIP */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="New York"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
              <div className="relative">
                <select
                  value={formData.state}
                  onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="">Select</option>
                  <option value="NY">NY</option>
                  <option value="CA">CA</option>
                  <option value="TX">TX</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
              <input
                type="text"
                value={formData.zip}
                onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
                placeholder="10001"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              placeholder="+1 (555) 123-4567"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            />
          </div>

          {/* Default Checkbox */}
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.isDefault}
              onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              className="w-5 h-5 rounded border-gray-300 text-rose-500 focus:ring-rose-500"
            />
            <span className="text-gray-700">Set as default address</span>
          </label>
        </div>

        <div className="flex gap-4 p-6 border-t border-gray-100">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button className="flex-1 py-3 bg-rose-500 text-white rounded-xl font-semibold hover:bg-rose-600 transition-colors">
            {address ? 'Save Changes' : 'Add Address'}
          </button>
        </div>
      </div>
    </div>
  )
}

// Address Book Page
export function AddressBookPage() {
  const [addresses, setAddresses] = useState(sampleAddresses)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingAddress, setEditingAddress] = useState<typeof sampleAddresses[0] | null>(null)

  const handleSetDefault = (id: string) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      isDefault: addr.id === id
    })))
  }

  const handleDelete = (id: string) => {
    setAddresses(addresses.filter(addr => addr.id !== id))
  }

  const handleEdit = (address: typeof sampleAddresses[0]) => {
    setEditingAddress(address)
    setIsModalOpen(true)
  }

  const handleAdd = () => {
    setEditingAddress(null)
    setIsModalOpen(true)
  }

  return (
    <div className="py-8">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Saved Addresses</h2>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-rose-500 text-white rounded-xl font-medium hover:bg-rose-600 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Add Address
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center">
          <MapPin className="h-16 w-16 text-gray-200 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No addresses saved</h3>
          <p className="text-gray-500 mb-6">Add an address for faster checkout</p>
          <button
            onClick={handleAdd}
            className="px-6 py-3 bg-rose-500 text-white rounded-xl font-semibold hover:bg-rose-600 transition-colors"
          >
            Add Your First Address
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-6">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={() => handleEdit(address)}
              onDelete={() => handleDelete(address.id)}
              onSetDefault={() => handleSetDefault(address.id)}
            />
          ))}
        </div>
      )}

      <AddressFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        address={editingAddress}
      />
    </div>
  )
}

// Address Select (For checkout)
export function AddressSelect({
  addresses = sampleAddresses,
  selectedId,
  onSelect
}: {
  addresses?: typeof sampleAddresses
  selectedId?: string
  onSelect?: (id: string) => void
}) {
  return (
    <div className="space-y-4">
      {addresses.map((address) => (
        <label
          key={address.id}
          className={`flex items-start gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedId === address.id
              ? 'border-rose-500 bg-rose-50'
              : 'border-gray-200 hover:border-gray-300'
            }`}
        >
          <input
            type="radio"
            name="address"
            value={address.id}
            checked={selectedId === address.id}
            onChange={() => onSelect?.(address.id)}
            className="mt-1 w-5 h-5 text-rose-500 focus:ring-rose-500"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-gray-900 capitalize">{address.type}</span>
              {address.isDefault && (
                <span className="text-xs bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full">Default</span>
              )}
            </div>
            <p className="text-gray-600">{address.name}</p>
            <p className="text-gray-600">{address.address}{address.apartment && `, ${address.apartment}`}</p>
            <p className="text-gray-600">{address.city}, {address.state} {address.zip}</p>
          </div>
          <button className="text-rose-500 hover:text-rose-600 text-sm font-medium">
            Edit
          </button>
        </label>
      ))}

      <button className="w-full py-4 border-2 border-dashed border-gray-200 rounded-xl text-gray-500 hover:border-rose-300 hover:text-rose-500 transition-colors flex items-center justify-center gap-2">
        <Plus className="h-5 w-5" />
        Add New Address
      </button>
    </div>
  )
}
