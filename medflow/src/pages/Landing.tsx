import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <section className="mx-auto max-w-5xl py-10">
      <div className="grid items-center gap-8 md:grid-cols-2">
        <div>
          <h1 className="text-4xl font-bold leading-tight text-gray-100">MedFlow
            <span className="block text-2xl text-gray-200/80">Programări medicale simple și eficiente</span>
          </h1>
          <p className="mt-4 text-gray-200/80">
            O experiență calmă și modernă pentru medici și asistenți. Gestionați programările,
            documentele și fluxurile esențiale într-o interfață curată.
          </p>
          <div className="mt-6 flex gap-3">
            <Link to="/signup" className="btn-primary">Începe acum</Link>
            <Link to="/signin" className="btn-ghost">Autentificare</Link>
          </div>
        </div>
        <div className="card">
          <ul className="space-y-2 text-gray-100/90">
            <li>• Calendar săptămânal cu actualizări în timp real</li>
            <li>• Autentificare securizată cu Firebase</li>
            <li>• Încărcare documente PDF/JPEG</li>
            <li>• Chat intake pacient (placeholder AI)</li>
            <li>• Dark mode implicit</li>
          </ul>
        </div>
      </div>
    </section>
  )
}