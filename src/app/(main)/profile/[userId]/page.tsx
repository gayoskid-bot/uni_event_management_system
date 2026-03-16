import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { auth } from "@/server/auth"
import { getUserProfile } from "@/server/queries/users.queries"
import { getEventsByOrganizer } from "@/server/queries/events.queries"
import { isFollowing } from "@/server/actions/follow.actions"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { EventGrid } from "@/components/events/event-grid"
import { FollowButton } from "@/components/profile/follow-button"
import { getInitials, formatDate } from "@/lib/utils"
import { CalendarDays, GraduationCap, Users, MapPin } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface ProfilePageProps {
  params: Promise<{ userId: string }>
}

export async function generateMetadata({ params }: ProfilePageProps): Promise<Metadata> {
  const { userId } = await params
  const user = await getUserProfile(userId)
  if (!user) return { title: "User Not Found" }
  return { title: `${user.name}'s Profile` }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { userId } = await params
  const [user, session] = await Promise.all([
    getUserProfile(userId),
    auth(),
  ])

  if (!user) notFound()

  const isOwnProfile = session?.user?.id === userId
  const isOrganizer = user.role === "ORGANIZER" || user.role === "ADMIN"

  const [events, following] = await Promise.all([
    isOrganizer ? getEventsByOrganizer(userId) : Promise.resolve([]),
    session?.user && !isOwnProfile ? isFollowing(userId) : Promise.resolve(false),
  ])

  const publishedEvents = events.filter((e) => e.status === "PUBLISHED")

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Profile Header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row items-start gap-6">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.image || undefined} />
              <AvatarFallback className="text-2xl">
                {getInitials(user.name || "U")}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div>
                  <h1 className="text-2xl font-bold">{user.name}</h1>
                  <Badge variant="secondary" className="mt-1">
                    {user.role}
                  </Badge>
                </div>
                <div className="sm:ml-auto flex gap-2">
                  {isOwnProfile ? (
                    <Link href="/profile/settings">
                      <Button variant="outline" size="sm">
                        Edit Profile
                      </Button>
                    </Link>
                  ) : session?.user ? (
                    <FollowButton
                      targetUserId={userId}
                      isFollowing={following}
                    />
                  ) : null}
                </div>
              </div>

              {user.bio && (
                <p className="text-muted-foreground mt-3">{user.bio}</p>
              )}

              <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-muted-foreground">
                {user.department && (
                  <span className="flex items-center gap-1">
                    <GraduationCap className="h-4 w-4" />
                    {user.department}
                    {user.year && ` - Year ${user.year}`}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-4 w-4" />
                  Joined {formatDate(user.createdAt)}
                </span>
              </div>

              {/* Stats */}
              <div className="flex gap-6 mt-4">
                {isOrganizer && (
                  <div className="text-center">
                    <div className="text-lg font-bold">{user._count.organizedEvents}</div>
                    <div className="text-xs text-muted-foreground">Events</div>
                  </div>
                )}
                <div className="text-center">
                  <div className="text-lg font-bold">{user._count.followers}</div>
                  <div className="text-xs text-muted-foreground">Followers</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">{user._count.following}</div>
                  <div className="text-xs text-muted-foreground">Following</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Events by this organizer */}
      {isOrganizer && publishedEvents.length > 0 && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">
            Events by {isOwnProfile ? "you" : user.name}
          </h2>
          <EventGrid events={publishedEvents} />
        </div>
      )}
    </div>
  )
}
