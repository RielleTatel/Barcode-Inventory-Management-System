import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Check, X, Search } from "lucide-react";
import type { PendingUser } from "./index";
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

const PendingUsers = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedUser, setSelectedUser] = useState<PendingUser | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);

  // Mock data - replace with actual API call
  const mockPendingUsers: PendingUser[] = [
    {
      id: 1,
      username: "john_doe",
      email: "john.doe@example.com",
      firstName: "John",
      lastName: "Doe",
      dateRequested: "2026-01-15T10:30:00Z",
    },
    {
      id: 2,
      username: "jane_smith",
      email: "jane.smith@example.com",
      firstName: "Jane",
      lastName: "Smith",
      dateRequested: "2026-01-16T14:20:00Z",
    },
    {
      id: 3,
      username: "bob_wilson",
      email: "bob.wilson@example.com",
      firstName: "Bob",
      lastName: "Wilson",
      dateRequested: "2026-01-17T09:15:00Z",
    },
  ];

  const handleOpenDialog = (user: PendingUser, action: "approve" | "reject") => {
    setSelectedUser(user);
    setActionType(action);
  };

  const handleCloseDialog = () => {
    setSelectedUser(null);
    setActionType(null);
  };

  const handleConfirmAction = () => {
    if (!selectedUser || !actionType) return;
    
    // TODO: API call to approve/reject user
    console.log(`${actionType} user:`, selectedUser);
    
    handleCloseDialog();
  };

  const filteredUsers = mockPendingUsers.filter(
    (user) =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase())
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
                  <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                    No pending requests found
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>
                      {user.firstName} {user.lastName}
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {formatDate(user.dateRequested)}
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
