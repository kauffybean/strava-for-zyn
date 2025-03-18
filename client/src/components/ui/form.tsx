import React from 'react';
import { useForm, UseFormReturn, FieldValues, Path, RegisterOptions } from 'react-hook-form';

interface FormProps<TFormValues extends FieldValues> {
  children: (methods: UseFormReturn<TFormValues>) => React.ReactNode;
  onSubmit: (values: TFormValues) => void;
  defaultValues?: Partial<TFormValues>;
  className?: string;
}

export function Form<TFormValues extends FieldValues>({
  children,
  onSubmit,
  defaultValues,
  className = '',
}: FormProps<TFormValues>) {
  const methods = useForm<TFormValues>({ defaultValues });
  
  return (
    <form className={className} onSubmit={methods.handleSubmit(onSubmit)}>
      {children(methods)}
    </form>
  );
}

interface FormFieldProps<TFormValues extends FieldValues> {
  name: Path<TFormValues>;
  label?: string;
  children: React.ReactElement;
  rules?: RegisterOptions;
  methods: UseFormReturn<TFormValues>;
}

export function FormField<TFormValues extends FieldValues>({
  name,
  label,
  children,
  rules,
  methods,
}: FormFieldProps<TFormValues>) {
  const { register, formState: { errors } } = methods;
  const error = errors[name]?.message as string | undefined;
  
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      {React.cloneElement(children, {
        ...register(name, rules),
        id: name,
        error,
        "aria-invalid": error ? true : false,
      })}
      {error && (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      )}
    </div>
  );
}
