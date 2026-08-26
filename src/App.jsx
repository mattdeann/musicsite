// Swap this ID for the real YouTube video ID (the string after v= in a YouTube URL).
const YOUTUBE_VIDEO_ID = 'dQw4w9WgXcQ'
const PAGE_TITLE = 'Welcome'

export default function App() {
  return (
    <main className="page">
      <h1 className="title">{PAGE_TITLE}</h1>
      <div className="video-frame">
        <iframe
          src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}`}
          title="Embedded video"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    </main>
  )
}
