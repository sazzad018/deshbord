import InvoiceMaker from "@/components/InvoiceMaker";

export default function InvoiceMakerPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white text-slate-900">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold text-center mb-8">ইনভয়েস তৈরি করুন</h1>
        <InvoiceMaker />
      </div>
    </div>
  );
}