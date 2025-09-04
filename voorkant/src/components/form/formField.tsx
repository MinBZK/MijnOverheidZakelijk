import { AnyFieldApi } from "@tanstack/react-form";

function FormField({
  field,
  label,
  readOnly = false,
}: {
  field: AnyFieldApi;
  label?: string;
  readOnly?: boolean;
}) {
  return (
    <>
      {label && (
        <label
          className="mb-2 block text-sm font-bold text-gray-700"
          htmlFor={field.name}
        >
          {label}
        </label>
      )}

      <input
        disabled={readOnly}
        id={field.name}
        name={field.name}
        value={field.state.value ?? ""}
        onBlur={field.handleBlur}
        className={`focus:border-primary w-full rounded border-1 border-solid border-gray-200 ${!readOnly ? "bg-white" : "bg-gray-50"} px-1.5 py-1 focus:outline-none`}
        onChange={(e) => field.handleChange(e.target.value)}
      />
      <FieldInfo field={field} />
    </>
  );
}

export function FieldInfo({ field }: { field: AnyFieldApi }) {
  return (
    <>
      {field.state.meta.isTouched && !field.state.meta.isValid ? (
        <em className="text-red-600">{field.state.meta.errors[0].message}</em>
      ) : null}
      {field.state.meta.isValidating ? "Validating..." : null}
    </>
  );
}

export default FormField;
