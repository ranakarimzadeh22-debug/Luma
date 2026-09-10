import LumaLogo from "@/components/LumaLogo";
import PartnerAreaContent from "@/components/PartnerAreaContent";

export default function PartnerAreaPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-6" style={{ background: "#fafafa" }}>
      <div className="w-full max-w-xs">
        <div className="mb-8 flex flex-col items-center">
          <LumaLogo size={0.7} />
        </div>
        <PartnerAreaContent />
      </div>
    </main>
  );
}
