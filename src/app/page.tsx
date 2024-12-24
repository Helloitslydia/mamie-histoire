import AudioRecorder from '../components/AudioRecorder'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-purple-50 to-white">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-6xl font-bold text-center mb-6 text-gray-900 tracking-tight">
          Mamie Vouziers
        </h1>
        <p className="text-center text-gray-600 mb-12 text-xl font-light tracking-wide">
          Les histoires de Mamie Vouziers ❤️
        </p>
        <div className="max-w-2xl mx-auto bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-purple-50">
          <AudioRecorder />
        </div>
      </div>
    </main>
  )
}
