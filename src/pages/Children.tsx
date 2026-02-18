import { useState } from "react";
import Navbar from "@/components/Navbar";
import ChildrenList from "@/components/children/ChildrenList";
import ChildForm from "@/components/children/ChildForm";
import { ListFilter, UserPlus } from "lucide-react";
import { useChildren, useAddChild, useUpdateChild, useDeleteChild } from "@/hooks/useChildren";
import { useAllGroups } from "@/hooks/useGroups";
import type { DbChild, DbChildWithGroup } from "@/types/database";

const Children = () => {
  const [activeTab, setActiveTab] = useState<"list" | "add">("list");
  const [editingChild, setEditingChild] = useState<DbChildWithGroup | null>(null);

  const { data: children = [], isLoading } = useChildren();
  const { data: groups = [] } = useAllGroups();
  const addChild = useAddChild();
  const updateChild = useUpdateChild();
  const deleteChild = useDeleteChild();

  const handleAddChild = (child: Omit<DbChild, "id" | "created_at" | "updated_at">, groupId?: string) => {
    addChild.mutate({ child, groupId }, {
      onSuccess: () => setActiveTab("list"),
    });
  };

  const handleUpdateChild = (child: Omit<DbChild, "id" | "created_at" | "updated_at">, groupId?: string) => {
    if (!editingChild) return;
    updateChild.mutate({ id: editingChild.id, child, groupId }, {
      onSuccess: () => {
        setEditingChild(null);
        setActiveTab("list");
      },
    });
  };

  const handleDeleteChild = (id: string) => {
    deleteChild.mutate(id);
  };

  const handleEdit = (child: DbChildWithGroup) => {
    setEditingChild(child);
    setActiveTab("add");
  };

  const handleCancelEdit = () => {
    setEditingChild(null);
    setActiveTab("list");
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto space-y-6 px-6 py-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-foreground">Облік дітей</h1>
          <div className="flex overflow-hidden rounded-xl border border-border">
            <button
              onClick={() => {
                setActiveTab("list");
                setEditingChild(null);
              }}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold transition-colors ${
                activeTab === "list"
                  ? "bg-primary/10 text-primary"
                  : "bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              <ListFilter className="h-4 w-4" />
              Список дітей
            </button>
            <button
              onClick={() => {
                setActiveTab("add");
                if (activeTab !== "add") setEditingChild(null);
              }}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold transition-colors ${
                activeTab === "add"
                  ? "bg-primary/10 text-primary"
                  : "bg-card text-muted-foreground hover:bg-muted"
              }`}
            >
              <UserPlus className="h-4 w-4" />
              {editingChild ? "Редагувати дитину" : "Додати дитину"}
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12 text-muted-foreground">
            Завантаження...
          </div>
        ) : activeTab === "list" ? (
          <ChildrenList
            children={children}
            onEdit={handleEdit}
            onDelete={handleDeleteChild}
          />
        ) : (
          <ChildForm
            onSubmit={editingChild ? handleUpdateChild : handleAddChild}
            onCancel={handleCancelEdit}
            initialData={editingChild}
            groups={groups}
          />
        )}
      </main>
    </div>
  );
};

export default Children;
