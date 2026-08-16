export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-base p-8 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold gradient-text mb-6">Privacy Policy</h1>
      <div className="space-y-4 text-sm text-white/70 leading-relaxed">
        <p><strong>Data Collected:</strong> Email, name, chat messages, payment status। আমরা কোনো credit card data store করি না (payment processor-এ থাকে)।</p>
        <p><strong>AI Processing:</strong> Chat messages AI provider (DeepSeek/OpenRouter/OpenAI) এর কাছে processed হয় response দিতে।</p>
        <p><strong>Cookies & Ads:</strong> আমরা Adsterra ও partner ad networks ব্যবহার করি। তারা behavioral ads এর জন্য cookies ব্যবহার করতে পারে। Opt-out: <a href="https://www.youronlinechoices.eu" className="text-neon-purple">youronlinechoices.eu</a></p>
        <p><strong>Data Deletion:</strong> যেকোনো সময় email করে account + সব data delete করাতে পারবে।</p>
        <p><strong>Third Parties:</strong> আমরা কোনো personal data বিক্রি করি না।</p>
      </div>

      <h2 id="dmca" className="text-2xl font-bold gradient-text mt-10 mb-4">DMCA</h2>
      <div className="space-y-4 text-sm text-white/70 leading-relaxed">
        <p>Copyright infringement complaint পাঠাও: <span className="text-neon-purple">dmca@yourdomain.com</span> — ৪৮ ঘণ্টার মধ্যে content remove করা হবে।</p>
      </div>
    </div>
  );
}