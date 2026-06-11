export default function Contact() {
  return (
    <div className="container mx-auto px-4 mt-12 mb-12 max-w-lg">
      <div className="bg-white rounded-2xl shadow-lg p-8">
        <h2 className="text-3xl font-bold text-center text-pink-500 mb-6">Contact Us</h2>
        <form>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Name</label>
            <input type="text" className="w-full border-gray-300 rounded-lg px-4 py-2 border focus:ring-pink-500 focus:border-pink-500 outline-none transition-all" placeholder="Enter your name" />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Email</label>
            <input type="email" className="w-full border-gray-300 rounded-lg px-4 py-2 border focus:ring-pink-500 focus:border-pink-500 outline-none transition-all" placeholder="Enter your email" />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-2">Message</label>
            <textarea className="w-full border-gray-300 rounded-lg px-4 py-2 border focus:ring-pink-500 focus:border-pink-500 outline-none transition-all h-32" placeholder="Your message here..."></textarea>
          </div>
          <button type="button" className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-4 rounded-lg shadow transition-all">
            Send Message
          </button>
        </form>
      </div>
    </div>
  );
}
