import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, X, Search } from "lucide-react";
import { Activity } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAllUsers, updateUser, type User } from "@/api/accountApi";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ========== LOADING COMPONENT ==========
const LoadingState = () => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <Activity className="h-12 w-12 animate-spin mx-auto mb-4" style={{ color: '#0033A0' }} />
      <p className="text-gray-600">Loading health data...</p>
    </div>
  </div>
); 

  // ========== QUERY KEYS ==========
const QUERY_KEYS = {
  PENDING_USERS: ['users', 'pending'],
};

const PendingUsers = () => { 
  
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const queryClient = useQueryClient();

  // Fetch all users and filter for pending (status = false)
  const { data: allUsers = [], isLoading, error } = useQuery({
    queryKey: QUERY_KEYS.PENDING_USERS,
    queryFn: fetchAllUsers,
    select: (users) => users.filter(user => user.status === false),
  });

  // Mutation for updating user status
  const updateUserMutation = useMutation({
    mutationFn: ({ userId, updates }: { userId: number; updates: Partial<User> }) => 
      updateUser(userId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.PENDING_USERS });
    },
  }); 

  const handleOpenDialog = (user: User, action: "approve" | "reject") => {
    setSelectedUser(user);
    setActionType(action);
  };

  const handleCloseDialog = () => {
    setSelectedUser(null);
    setActionType(null);
  };

  const handleConfirmAction = async () => {
    if (!selectedUser || !actionType) return;
    
    if (actionType === "approve") {
      await updateUserMutation.mutateAsync({
        userId: selectedUser.id,
        updates: { status: true, is_active: true }
      });
    } else {
      await updateUserMutation.mutateAsync({
        userId: selectedUser.id,
        updates: { is_active: false }
      });
    }
    
    handleCloseDialog();
  };

  const filteredUsers = allUsers.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.last_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) return <LoadingState />;
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center text-red-600">
          <p>Error loading pending users</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full bg-white rounded-xl border border-[#E5E5E5] p-6">
        {/* Search and Filter */}
        <div className="flex justify-between items-center mb-6">
          <div className="relative w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search by name, username, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="text-sm text-gray-600">
            {filteredUsers.length} pending {filteredUsers.length === 1 ? "request" : "requests"}
          </div>
        </div>

        {/* Table */}
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Username</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Date Requested</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                    No pending requests found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>
                      {user.first_name} {user.last_name}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {formatDate(user.date_joined)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => handleOpenDialog(user, "approve")}
                        >
                          <Check className="w-4 h-4 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleOpenDialog(user, "reject")}
                        >
                          <X className="w-4 h-4 mr-1" />
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={selectedUser !== null} onOpenChange={handleCloseDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === "approve" ? "Approve User Registration" : "Reject User Registration"}
            </DialogTitle>
            <DialogDescription className="pt-4">
              {actionType === "approve" ? (
                <>
                  Are you sure you want to approve <strong>{selectedUser?.username}</strong>?
                  <br />
                  <br />
                  This user will gain access to the system with standard permissions.
                </>
              ) : (
                <>
                  Are you sure you want to reject <strong>{selectedUser?.username}</strong>'s registration request?
                  <br />
                  <br />
                  This action will remove their pending request.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmAction}
              className={
                actionType === "approve"
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-red-600 hover:bg-red-700"
              }
            >
              {actionType === "approve" ? "Approve" : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default PendingUsers;
