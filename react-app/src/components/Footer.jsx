export default function Footer() {
  return (
    <footer className="bg-pink-400 text-white text-center py-4 mt-auto shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
      <div className="container mx-auto px-4">
        Tanakorn Tipwarreerattana &copy; {new Date().getFullYear()}. All Rights Reserved
      </div>
    </footer>
  );
}
