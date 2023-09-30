import { useNavigate } from 'react-router-dom'
export default function Home() {
  const nav = useNavigate()
  return (
    <div className="min-h-[90vh] bg-black flex flex-col-reverse pb-5 md:flex-row md:pb-0 md:items-center overflow-hidden md:justify-around">
      <div className="px-5 flex flex-col gap-6 h-[100%] md:w-[40%]">
        <h1 className="text-white text-5xl font-semibold md:text-7xl">Organize Your Task More Easily With Us</h1>
        <p className="text-white">Streamline your workflow and enhance productivity with our powerful task management software. It's a powerful tool that simplifies task organization and enhances productivity.</p>
        <button onClick={() => nav('/board')} className="bg-yellow-400 px-5 py-1.5 rounded font-bold w-max" type="submit">Get Started</button>
      </div>
      <img src="https://rb.gy/k61vp" alt="" className="md:w-[45%]" />
    </div>
  )
}
