import Gallery from '../components/Gallery'

export default function Boston() {
  return (
    <Gallery
      dataUrl="/data/boston.json"
      title="Boston"
      subtitle="Uma seleção de fotos e vídeos tirados durante meu período na cidade."
    />
  )
}
