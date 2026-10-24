// Company ke pehle harf ka gol/chorus logo
export default function CompanyAvatar({ name, large = false }: { name: string; large?: boolean }) {
  const size = large ? "h-16 w-16 text-2xl" : "h-12 w-12 text-lg";
  return (
    <div className={`flex shrink-0 items-center justify-center rounded-xl bg-[#22345A] font-extrabold text-teal-300 ${size}`}>
      {name.charAt(0).toUpperCase()}
    </div>
  );
}