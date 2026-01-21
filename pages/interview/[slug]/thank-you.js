import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';

export default function ThankYou() {
  const router = useRouter();
  const { slug } = router.query;
  const [isLoading, setIsLoading] = useState(true);

  
 useEffect(() => {
  if (!router.isReady) return;

  const safeSlug =
    router.query.slug || localStorage.getItem("currentJobSlug");

  if (!safeSlug) {
    console.error("Missing job slug, cannot redirect");
    return;
  }

  console.log("Redirecting with slug:", safeSlug);

  const timer = setTimeout(() => {
    router.push(`/admin/mock/role/${safeSlug}`);
  }, 8000);

  setIsLoading(false);
  return () => clearTimeout(timer);
}, [router.isReady, router.query.slug]);



  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800">
      <div className="text-center p-8 max-w-2xl">
        <div className="mb-6">
          <svg className="w-24 h-24 mx-auto text-blue-500 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <h1 className="text-4xl font-bold text-white mb-4"> Thank You!</h1>
        
       <h1 className="text-4xl font-bold text-white mb-4">
   Assessment Completed
</h1>

<p className="text-xl text-gray-300 mb-6">
  You have successfully completed the assessment round.
</p>

<p className="text-gray-400 mb-8">
  Your mock interview is coming up next. Please stay prepared and continue when redirected.
</p>

<div className="bg-gradient-to-r from-gray-800 to-gray-700 p-6 rounded-lg mb-8">
  <p className="text-gray-300 text-sm">
    Setting up your mock interview.
    Redirecting in <span className="text-green-400 font-semibold">8 seconds</span>...
  </p>
</div>


        {/* <button
          onClick={() => router.push('/admin/Mock/role')}
          className="px-8 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all transform hover:scale-105"
        >
          
        </button> */}
      </div>
    </div>
  );
}