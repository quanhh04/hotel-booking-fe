import Button from "./Button";

export default function ErrorCard({ message = "Đã có lỗi xảy ra", onRetry, className = "" }) {
  return (
    <div className={`rounded-lg border border-red-200 bg-red-50 p-6 text-center ${className}`}>
      <p className="text-sm text-red-700">{message}</p>
      {onRetry && (
        <Button variant="secondary" className="mt-4" onClick={onRetry}>
          Thử lại
        </Button>
      )}
    </div>
  );
}
