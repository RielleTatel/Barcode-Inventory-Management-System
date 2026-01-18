import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Trash2, Shield } from "lucide-react";
import type { User } from "./index";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const ApprovedUsers = () => {
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [actionType, setActionType] = useState<"remove" | null>(null);

  const mockApprovedUsers: User[] = [
    {
      id: 1,
      username: "admin_user",
      email: "admin@barcode.com",
      firstName: "Admin",
      lastName: "User",
      dateJoined: "2025-12-01T10:00:00Z",
      isActive: true,
      isSuperuser: true,
      isStaff: true,
    },
    {
      id: 2,
      username: "sarah_manager",
      email: "sarah.manager@barcode.com",
      firstName: "Sarah",
      lastName: "Manager",
      dateJoined: "2025-12-15T14:30:00Z",
      isActive: true,
      isSuperuser: false,
      isStaff: true,
    },
    {
      id: 3,
      username: "mike_staff",
      email: "mike.staff@barcode.com",
      firstName: "Mike",
      lastName: "Staff",
      dateJoined: "2026-01-05T09:20:00Z",
      isActive: true,
      isSuperuser: false,
      isStaff: false,
    },
    {
      id: 4,
      username: "lisa_inactive",
      email: "lisa.inactive@barcode.com",
      firstName: "Lisa",
      lastName: "Inactive",
      dateJoined: "2025-11-20T11:45:00Z",
      isActive: false,
      isSuperuser: false,
      isStaff: false,
    },
  ];

  const handleOpenDialog = (user: User, action: "remove") => {
    setSelectedUser(user);
    setActionType(action);
  };

  const handleCloseDialog = () => {
    setSelectedUser(null);
    setActionType(null);
  };

  const handleConfirmAction = () => {
    if (!selectedUser || !actionType) return;
    
    // TODO: API call to remove user
    console.log(`${actionType} user:`, selectedUser);
    
    handleCloseDialog();
  };

  const filteredUsers = mockApprovedUsers.filter((user) => {
    const matchesSearch =
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFilter =
      filterStatus === "all" ||
      (filterStatus === "active" && user.isActive) ||
      (filterStatus === "inactive" && !user.isActive) ||
      (filterStatus === "admin" && user.isSuperuser) ||
      (filterStatus === "staff" && user.isStaff && !user.isSuperuser);

    return matchesSearch && matchesFilter;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getUserRole = (user: User): string => {
    if (user.isSuperuser) return "Admin";
    if (user.isStaff) return "Staff";
    return "User";
  };

  const getRoleBadgeClass = (user: User): string => {
    if (user.isSuperuser) return "bg-purple-100 text-purple-700";
    if (user.isStaff) return "bg-blue-100 text-blue-700";
    return "bg-gray-100 text-gray-700";
  };

  return (
    <>
      <div className="w-full bg-white rounded-xl border border-[#E5E5E5] p-6">
        {/* Search and Filter */}
        <div className="flex justify-between items-center mb-6 gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-3">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
                <SelectItem value="staff">Staff</SelectItem>
              </SelectContent>
            </Select>
            <div className="text-sm text-gray-600">
              {filteredUsers.length} {filteredUsers.length === 1 ? "user" : "users"}
            </div>
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
                <TableHead>Role</TableHead>
                <TableHead>Date Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                    No users found
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
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeClass(
                          user
                        )}`}
                      >
                        {user.isSuperuser && <Shield className="w-3 h-3 mr-1" />}
                        {getUserRole(user)}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {formatDate(user.dateJoined)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {!user.isSuperuser ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleOpenDialog(user, "remove")}
                          >
                            <Trash2 className="w-4 h-4 mr-1" />
                            Remove
                          </Button>
                        ) : (
                          <span className="text-sm text-gray-400 italic px-3 py-1">
                            Protected
                          </span>
                        )}
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
            <DialogTitle>Remove User</DialogTitle>
            <DialogDescription className="pt-4">
              Are you sure you want to permanently remove <strong>{selectedUser?.username}</strong>?
              <br />
              <br />
              This action cannot be undone. All user data and permissions will be deleted.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button
              onClick={handleConfirmAction}
              className="bg-red-600 hover:bg-red-700"
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ApprovedUsers;
