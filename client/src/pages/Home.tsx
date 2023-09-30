export default function Home() {
  return (
    <div className="min-h-[90vh] bg-black flex flex-col-reverse pb-10 md:flex-row md:pb-0 md:items-center">
      <div className="px-5 flex flex-col gap-6 h-[100%] ">
        <h1 className="text-white text-5xl">Organize Your Task More Easily With Us</h1>
        <p className="text-white">Streamline your workflow and enhance productivity with our powerful task management software.It's a powerful tool that simplifies task organization and enhances productivity.</p>
        <button className="bg-yellow-400 px-5 py-1.5 rounded font-bold w-max" type="submit">Get Started</button>
      </div>
      <img src="https://rb.gy/k61vp" alt="" className="md:w-[50%]" />
    </div>
  )
}
