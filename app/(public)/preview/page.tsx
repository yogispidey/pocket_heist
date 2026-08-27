// preview page for newly created UI components
import Skeleton from "@/components/Skeleton"
import Avatar from "@/components/Avatar"

export default function PreviewPage() {
  return (
    <div className="page-content">
      <h2>Preview</h2>
      <div className="grid grid-cols-1 gap-4 mt-6 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton />
        <Skeleton />
        <Skeleton />
      </div>

      <h3 className="mt-10 mb-4">Avatar</h3>
      <div className="flex items-center gap-4">
        <Avatar name="John Doe" />
        <Avatar name="Alice Smith" />
        <Avatar name="Prince" />
        <Avatar name="Yogesh Chandra" />
      </div>
    </div>
  )
}
