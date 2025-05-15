import React, { useState, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Camera, Pencil, X, Grid, Columns, Trash2 } from "lucide-react";

interface Photo {
  id: string;
  url: string;
  description: string;
  timestamp: string;
  annotations?: string;
  type?: string;
}

interface PhotosTabProps {
  photos: Photo[];
  onUpdatePhoto?: (updatedPhoto: Photo) => void;
  onDeletePhoto?: (photoId: string) => void;
}

const PhotosTab: React.FC<PhotosTabProps> = ({
  photos,
  onUpdatePhoto,
  onDeletePhoto,
}) => {
  const [editingPhoto, setEditingPhoto] = useState<Photo | null>(null);
  const [editedDescription, setEditedDescription] = useState("");
  const [editedAnnotations, setEditedAnnotations] = useState("");
  const [editedType, setEditedType] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "comparison">("grid");
  const [activePhotoType, setActivePhotoType] = useState<string>("before");
  const [photoToDelete, setPhotoToDelete] = useState<Photo | null>(null);

  const handleEditClick = (photo: Photo) => {
    setEditingPhoto(photo);
    setEditedDescription(photo.description || "");
    setEditedAnnotations(photo.annotations || "");
    setEditedType(photo.type || "general");
  };

  const handleCloseDialog = () => {
    setEditingPhoto(null);
  };

  const handleDeleteClick = (photo: Photo) => {
    setPhotoToDelete(photo);
  };

  const handleConfirmDelete = () => {
    if (photoToDelete && onDeletePhoto) {
      onDeletePhoto(photoToDelete.id);
    }
    setPhotoToDelete(null);
  };

  const handleSaveChanges = () => {
    if (editingPhoto && onUpdatePhoto) {
      const updatedPhoto = {
        ...editingPhoto,
        description: editedDescription,
        annotations: editedAnnotations,
        type: editedType,
      };
      onUpdatePhoto(updatedPhoto);
    }
    handleCloseDialog();
  };

  // Group photos by type for comparison view
  const photosByType = useMemo(() => {
    const grouped: Record<string, Photo[]> = {};

    photos.forEach((photo) => {
      const type = photo.type || "general";
      if (!grouped[type]) {
        grouped[type] = [];
      }
      grouped[type].push(photo);
    });

    return grouped;
  }, [photos]);

  // Get unique photo types for tabs
  const photoTypes = useMemo(() => {
    return Object.keys(photosByType).filter(
      (type) =>
        // Only include types that have photos
        photosByType[type].length > 0,
    );
  }, [photosByType]);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Room Photos</CardTitle>
            <CardDescription>
              Document the room with photos for assessment
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="h-4 w-4 mr-1" /> Grid
            </Button>
            <Button
              variant={viewMode === "comparison" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("comparison")}
            >
              <Columns className="h-4 w-4 mr-1" /> Compare
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {photos.map((photo) => (
              <div key={photo.id} className="border rounded-md overflow-hidden">
                <img
                  src={photo.url}
                  alt={photo.description}
                  className="w-full h-48 object-cover"
                />
                <div className="p-3">
                  <p className="font-medium">{photo.description}</p>
                  {photo.annotations && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {photo.annotations}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(photo.timestamp).toLocaleString()}
                  </p>
                  <div className="flex justify-between items-center mt-2">
                    {photo.type && (
                      <span className="text-xs px-2 py-1 bg-secondary text-secondary-foreground rounded-full">
                        {photo.type}
                      </span>
                    )}
                    <div className="flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditClick(photo)}
                      >
                        <Pencil className="h-4 w-4 mr-1" /> Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteClick(photo)}
                        className="text-destructive hover:text-destructive/90"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div className="border rounded-md border-dashed flex items-center justify-center h-64 cursor-pointer hover:bg-accent/50">
              <div className="text-center">
                <Camera className="h-8 w-8 mx-auto text-muted-foreground" />
                <p className="mt-2 font-medium">Add New Photo</p>
                <p className="text-sm text-muted-foreground">
                  Click to upload or take a photo
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="comparison-view">
            {photoTypes.length > 0 ? (
              <Tabs
                defaultValue={photoTypes[0]}
                value={activePhotoType}
                onValueChange={setActivePhotoType}
                className="w-full"
              >
                <TabsList className="mb-4">
                  {photoTypes.map((type) => (
                    <TabsTrigger key={type} value={type} className="capitalize">
                      {type}
                    </TabsTrigger>
                  ))}
                </TabsList>

                {photoTypes.map((type) => (
                  <TabsContent key={type} value={type} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {photosByType[type].map((photo) => (
                        <div
                          key={photo.id}
                          className="border rounded-md overflow-hidden"
                        >
                          <div className="relative">
                            <img
                              src={photo.url}
                              alt={photo.description}
                              className="w-full h-64 object-cover"
                            />
                            <div className="absolute top-2 right-2 flex space-x-1">
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleEditClick(photo)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => handleDeleteClick(photo)}
                                className="bg-destructive/90 hover:bg-destructive text-destructive-foreground"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          <div className="p-4">
                            <p className="font-medium text-lg">
                              {photo.description}
                            </p>
                            {photo.annotations && (
                              <p className="text-sm text-muted-foreground mt-2">
                                {photo.annotations}
                              </p>
                            )}
                            <p className="text-xs text-muted-foreground mt-2">
                              {new Date(photo.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                ))}
              </Tabs>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No photos available for comparison
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>

      {/* Edit Photo Dialog */}
      <Dialog
        open={editingPhoto !== null}
        onOpenChange={(open) => !open && handleCloseDialog()}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Photo Details</DialogTitle>
            <DialogDescription>
              Update the metadata for this photo
            </DialogDescription>
          </DialogHeader>

          {editingPhoto && (
            <div className="space-y-4">
              <div className="flex justify-center mb-4">
                <img
                  src={editingPhoto.url}
                  alt={editingPhoto.description}
                  className="h-40 object-contain rounded-md"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={editedDescription}
                  onChange={(e) => setEditedDescription(e.target.value)}
                  placeholder="Enter a description for this photo"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="annotations">Annotations</Label>
                <Textarea
                  id="annotations"
                  value={editedAnnotations}
                  onChange={(e) => setEditedAnnotations(e.target.value)}
                  placeholder="Add any notes or annotations"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Photo Type</Label>
                <Select value={editedType} onValueChange={setEditedType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general">General</SelectItem>
                    <SelectItem value="before">Before Modification</SelectItem>
                    <SelectItem value="after">After Modification</SelectItem>
                    <SelectItem value="issue">Issue Documentation</SelectItem>
                    <SelectItem value="measurement">
                      Measurement Reference
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <DialogFooter className="flex justify-between sm:justify-between">
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleSaveChanges}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Photo Confirmation Dialog */}
      <AlertDialog
        open={photoToDelete !== null}
        onOpenChange={(open) => !open && setPhotoToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Photo</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this photo? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {photoToDelete && (
            <div className="my-4 flex justify-center">
              <img
                src={photoToDelete.url}
                alt={photoToDelete.description}
                className="h-40 object-contain rounded-md"
              />
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default PhotosTab;
