import { SearchOutlined } from "@ant-design/icons";

type AdminSearchInputProps = {
  placeholder: string;
  className?: string;
};

export default function AdminSearchInput({
  placeholder,
  className = "",
}: AdminSearchInputProps) {
  return (
    <label
      className={`flex h-control-h items-center rounded-[10px] border border-border bg-surface-alt px-3 text-text-secondary transition-all focus-within:border-primary-container focus-within:ring-2 focus-within:ring-primary-fixed ${className}`}
    >
      <SearchOutlined className="mr-2 text-[18px] text-text-muted" />
      <input
        type="search"
        placeholder={placeholder}
        className="h-full w-full bg-transparent text-body-md text-text-main outline-none placeholder:text-text-muted"
      />
    </label>
  );
}
