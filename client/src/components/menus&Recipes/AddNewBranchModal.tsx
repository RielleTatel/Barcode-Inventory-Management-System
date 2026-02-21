"use client"

import * as React from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "../ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createBranch, type BranchFormData } from "@/api/branchesApi"

interface AddMenuItemDialogProps {
  onSubmit?: (value: string) => void
  trigger?: React.ReactNode
}

export const AddNewBranchModal = ({
  onSubmit,
  trigger,
}: AddMenuItemDialogProps) => {
  const [formData, setFormData] = React.useState<BranchFormData>({
    name: "",
    branch_type: "cafe_only",
    address: ""
  })
  const [open, setOpen] = React.useState(false)
  const [error, setError] = React.useState<string>("")
  
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: createBranch,
    onSuccess: (data) => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({ queryKey: ['branches'] })
      queryClient.invalidateQueries({ queryKey: ['menu-items'] })
      
      alert(`Branch "${data.name}" created successfully!`)
      
      // Call the legacy onSubmit if provided
      if (onSubmit) {
        onSubmit(data.name)
      }
      
      // Reset form and close modal
      setFormData({ name: "", branch_type: "cafe_only", address: "" })
      setError("")
      setOpen(false)
    },
    onError: (err: any) => {
      const errorMessage = err.response?.data?.message || 
                          err.response?.data?.name?.[0] || 
                          err.response?.data?.branch_type?.[0] ||
                          err.response?.data?.address?.[0] ||
                          "Failed to create branch. Please try again."
      setError(errorMessage)
    }
  })

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")

    // Validation
    if (!formData.name.trim()) {
      setError("Branch name is required")
      return
    }
    if (!formData.address.trim()) {
      setError("Address is required")
      return
    }

    // Submit
    createMutation.mutate(formData)
  }

  const handleChange = (field: keyof BranchFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger && (
        <DialogTrigger asChild>
          {trigger}
        </DialogTrigger>
      )}

      <DialogContent className="max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <span> 🍽️ </span>
            Add New Branch Location
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="branchName" className="text-sm font-medium">
              Branch Name <span className="text-red-500">*</span>
            </label>
            <Input
              id="branchName"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              placeholder="e.g. Downtown Cafe"
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="branchType" className="text-sm font-medium">
              Branch Type <span className="text-red-500">*</span>
            </label>
            <Select 
              value={formData.branch_type} 
              onValueChange={(value) => handleChange('branch_type', value as 'kitchen' | 'cafe_only')}
            >
              <SelectTrigger className="h-12">
                <SelectValue placeholder="Select branch type" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Branch Type</SelectLabel>
                  <SelectItem value="kitchen">Full-Service Restaurant</SelectItem>
                  <SelectItem value="cafe_only">Resto Café (No Cooking)</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label htmlFor="address" className="text-sm font-medium">
              Address <span className="text-red-500">*</span>
            </label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => handleChange('address', e.target.value)}
              placeholder="e.g. 123 Main Street, City"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <span className="font-semibold">Note:</span> All fields marked with{" "}
              <span className="text-red-500">*</span> are required.
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setOpen(false)
                setError("")
              }}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>

            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? "Creating..." : "Submit"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
