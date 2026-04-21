export interface CourseFormProps {
  initialData?: Record<string, any>;
  onSubmit: (data: Record<string, any>) => Promise<void>;
  isEditing?: boolean;
  isSubmitting?: boolean;
}
