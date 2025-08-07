import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <section className="mx-auto max-w-5xl py-10">
      <div className="grid items-center gap-8 md:grid-cols-2">
        <div>
          <h1 className="text-4xl font-bold leading-tight">MedFlow
            <span className="block text-2xl text-gray-600 dark:text-gray-300">Programări. Documente. Flux eficient.</span>
          </h1>
          <p className="mt-4 text-gray-600 dark:text-gray-300">
            Aplicație pentru medici și asistenți din România, cu programări în timp real,
            gestionare pacienți și documente, pregătită pentru funcții AI.
          </p>
          <div className="mt-6 flex gap-3">
            <Link to="/signup" className="btn-primary">Începe acum</Link>
            <Link to="/signin" className="btn-ghost">Autentificare</Link>
          </div>
        </div>
        <div className="card">
          <ul className="space-y-2">
            <li>• Calendar săptămânal și programări colorate</li>
            <li>• Autentificare securizată cu Firebase</li>
            <li>• Încărcare documente PDF/JPEG</li>
            <li>• Chat de intake pacient (placeholder AI)</li>
            <li>• Modul întunecat</li>
          </ul>
        </div>
      </div>
    </section>
  )
}