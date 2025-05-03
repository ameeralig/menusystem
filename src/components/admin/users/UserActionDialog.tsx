
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { User } from "@/components/admin/users/userTypes";

interface UserActionDialogProps {
  showActionDialog: boolean;
  setShowActionDialog: (show: boolean) => void;
  selectedUser: User | null;
  dialogAction: "ban" | "delete" | "role" | "message" | "approve";
  isAdmin: boolean;
  setIsAdmin: (isAdmin: boolean) => void;
  message: string;
  setMessage: (message: string) => void;
  isProcessing: boolean;
  handleUserAction: (action: string) => Promise<void>;
}

const UserActionDialog = ({
  showActionDialog,
  setShowActionDialog,
  selectedUser,
  dialogAction,
  isAdmin,
  setIsAdmin,
  message,
  setMessage,
  isProcessing,
  handleUserAction
}: UserActionDialogProps) => {
  return (
    <Dialog open={showActionDialog} onOpenChange={setShowActionDialog}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {dialogAction === "ban" && (selectedUser?.status === "banned" 
              ? "تأكيد إلغاء حظر المستخدم"
              : "تأكيد حظر المستخدم"
            )}
            {dialogAction === "delete" && "تأكيد حذف حساب المستخدم"}
            {dialogAction === "role" && (isAdmin 
              ? "تأكيد ترقية المستخدم إلى مسؤول"
              : "تأكيد إزالة صلاحية المسؤول"
            )}
            {dialogAction === "message" && "إرسال إشعار للمستخدم"}
            {dialogAction === "approve" && "تأكيد تفعيل الحساب"}
          </DialogTitle>
        </DialogHeader>
        
        {dialogAction === "ban" && (
          <div>
            <p>
              {selectedUser?.status === "banned" 
                ? `هل أنت متأكد من إلغاء حظر المستخدم ${selectedUser?.email}؟`
                : `هل أنت متأكد من حظر المستخدم ${selectedUser?.email}؟`
              }
            </p>
            
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setShowActionDialog(false)}>
                إلغاء
              </Button>
              <Button 
                variant={selectedUser?.status === "banned" ? "default" : "destructive"}
                onClick={() => handleUserAction("ban")}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Spinner className="h-4 w-4 mr-2" />
                    جاري المعالجة...
                  </>
                ) : (
                  selectedUser?.status === "banned" ? "إلغاء الحظر" : "حظر المستخدم"
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
        
        {dialogAction === "delete" && (
          <div>
            <p className="text-red-500 font-semibold">تحذير: هذا الإجراء لا يمكن التراجع عنه!</p>
            <p className="mt-2">
              هل أنت متأكد من حذف حساب المستخدم {selectedUser?.email} وجميع بياناته؟
            </p>
            
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setShowActionDialog(false)}>
                إلغاء
              </Button>
              <Button 
                variant="destructive"
                onClick={() => handleUserAction("delete")}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Spinner className="h-4 w-4 mr-2" />
                    جاري المعالجة...
                  </>
                ) : (
                  "حذف الحساب نهائياً"
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
        
        {dialogAction === "role" && (
          <div>
            <p>
              {isAdmin 
                ? `هل أنت متأكد من ترقية المستخدم ${selectedUser?.email} إلى صلاحية مسؤول؟`
                : `هل أنت متأكد من إزالة صلاحية المسؤول من المستخدم ${selectedUser?.email}؟`
              }
            </p>
            
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setShowActionDialog(false)}>
                إلغاء
              </Button>
              <Button 
                variant={isAdmin ? "default" : "secondary"}
                onClick={() => handleUserAction("role")}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Spinner className="h-4 w-4 mr-2" />
                    جاري المعالجة...
                  </>
                ) : (
                  isAdmin ? "ترقية إلى مسؤول" : "إزالة صلاحية المسؤول"
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
        
        {dialogAction === "message" && (
          <div>
            <p className="mb-2">
              إرسال إشعار إلى المستخدم {selectedUser?.email}
            </p>
            
            <div className="space-y-2 my-4">
              <Label htmlFor="message">نص الإشعار</Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="اكتب نص الإشعار هنا..."
                className="min-h-[100px]"
              />
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowActionDialog(false)}>
                إلغاء
              </Button>
              <Button 
                variant="default"
                onClick={() => handleUserAction("message")}
                disabled={!message.trim() || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Spinner className="h-4 w-4 mr-2" />
                    جاري المعالجة...
                  </>
                ) : (
                  "إرسال الإشعار"
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
        
        {dialogAction === "approve" && (
          <div>
            <p>
              هل أنت متأكد من تفعيل حساب المستخدم {selectedUser?.email}؟
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              سيتمكن المستخدم من تسجيل الدخول واستخدام النظام بعد الموافقة.
            </p>
            
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setShowActionDialog(false)}>
                إلغاء
              </Button>
              <Button 
                variant="default"
                onClick={() => handleUserAction("approve")}
                disabled={isProcessing}
                className="bg-green-600 hover:bg-green-700"
              >
                {isProcessing ? (
                  <>
                    <Spinner className="h-4 w-4 mr-2" />
                    جاري التفعيل...
                  </>
                ) : (
                  "تفعيل الحساب"
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UserActionDialog;
