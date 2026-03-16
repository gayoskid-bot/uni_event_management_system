import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"
import {
  CalendarDays,
  MapPin,
  Globe,
  Users,
  MessageSquare,
  Share2,
  Clock,
  ArrowLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RegistrationButton } from "@/components/events/registration-button"
import { EventBookmarkButton } from "@/components/events/event-bookmark-button"
import { EventLikeButton } from "@/components/events/event-like-button"
import { EventShareButton } from "@/components/events/event-share-button"
import { CommentList } from "@/components/comments/comment-list"
import { getEventBySlug, getUserRegistration } from "@/server/queries/events.queries"
import { isBookmarked } from "@/server/actions/bookmark.actions"
import { isLiked } from "@/server/actions/like.actions"
import { formatDateTime, formatDate, getInitials } from "@/lib/utils"
import { auth } from "@/server/auth"

interface EventPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
  const { slug } = await params
  const event = await getEventBySlug(slug)
  if (!event) return { title: "Event Not Found" }

  return {
    title: event.title,
    description: event.summary || event.description.slice(0, 160),
    openGraph: {
      title: event.title,
      description: event.summary || event.description.slice(0, 160),
      images: event.coverImage ? [event.coverImage] : [],
    },
  }
}

export default async function EventPage({ params }: EventPageProps) {
  const { slug } = await params
  const [event, session] = await Promise.all([
    getEventBySlug(slug),
    auth(),
  ])

  if (!event) notFound()

  const spotsLeft = event.capacity
    ? event.capacity - event._count.registrations
    : null
  const isFull = spotsLeft !== null && spotsLeft <= 0
  const isOrganizer = session?.user?.id === event.organizerId

  // Fetch user-specific data
  const [registration, bookmarked, liked] = session?.user
    ? await Promise.all([
        getUserRegistration(event.id, session.user.id),
        isBookmarked(event.id),
        isLiked(event.id),
      ])
    : [null, false, false]

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link
        href="/events"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to events
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cover Image */}
          <div className="relative aspect-[2/1] rounded-xl overflow-hidden bg-muted">
            {event.coverImage ? (
              <Image
                src={event.coverImage}
                alt={event.title}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
                <CalendarDays className="h-20 w-20 text-primary/30" />
              </div>
            )}
          </div>

          {/* Categories & Tags */}
          <div className="flex flex-wrap gap-2">
            {event.categories.map(({ category }) => (
              <Link key={category.id} href={`/events/categories/${category.slug}`}>
                <Badge variant="secondary">{category.name}</Badge>
              </Link>
            ))}
            {event.tags.map(({ tag }) => (
              <Badge key={tag.id} variant="outline">
                {tag.name}
              </Badge>
            ))}
          </div>

          {/* Title */}
          <div>
            <h1 className="text-3xl font-bold">{event.title}</h1>
            {event.summary && (
              <p className="mt-2 text-lg text-muted-foreground">{event.summary}</p>
            )}
          </div>

          {/* Organizer */}
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarImage src={event.organizer.image || undefined} />
              <AvatarFallback>
                {getInitials(event.organizer.name || "O")}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium">Organized by</p>
              <p className="text-sm text-muted-foreground">
                {event.organizer.name}
              </p>
            </div>
          </div>

          <Separator />

          {/* Description */}
          <div className="prose prose-neutral dark:prose-invert max-w-none">
            <h2 className="text-xl font-semibold mb-4">About this event</h2>
            <div dangerouslySetInnerHTML={{ __html: event.description }} />
          </div>

          <Separator />

          {/* Comments */}
          <CommentList eventId={event.id} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="sticky top-20">
            <CardHeader>
              <CardTitle className="text-lg">Event Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Date */}
              <div className="flex items-start gap-3">
                <CalendarDays className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">{formatDate(event.startDate)}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDateTime(event.startDate)} - {formatDateTime(event.endDate)}
                  </p>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-3">
                {event.isOnline ? (
                  <Globe className="h-5 w-5 text-muted-foreground mt-0.5" />
                ) : (
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                )}
                <div>
                  <p className="font-medium">
                    {event.isOnline ? "Online Event" : event.venue || "TBD"}
                  </p>
                  {event.address && (
                    <p className="text-sm text-muted-foreground">{event.address}</p>
                  )}
                </div>
              </div>

              {/* Capacity */}
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">
                    {event._count.registrations} attending
                  </p>
                  {event.capacity && (
                    <p className="text-sm text-muted-foreground">
                      {spotsLeft !== null && spotsLeft > 0
                        ? `${spotsLeft} of ${event.capacity} spots remaining`
                        : `${event.capacity} capacity (full)`}
                    </p>
                  )}
                </div>
              </div>

              {/* Price */}
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-muted-foreground" />
                <Badge variant={event.isFree ? "default" : "secondary"}>
                  {event.isFree ? "Free" : "Paid Event"}
                </Badge>
              </div>

              <Separator />

              {/* Registration / Edit */}
              {isOrganizer ? (
                <Link href={`/dashboard/events/${event.id}/edit`} className="w-full">
                  <Button className="w-full">Edit Event</Button>
                </Link>
              ) : session?.user ? (
                <RegistrationButton
                  eventId={event.id}
                  isFree={event.isFree}
                  isFull={isFull}
                  waitlistEnabled={event.waitlistEnabled}
                  registration={registration}
                />
              ) : (
                <Link href={`/login?callbackUrl=/events/${event.slug}`} className="w-full">
                  <Button className="w-full" size="lg">
                    Sign in to Register
                  </Button>
                </Link>
              )}

              {/* Social Actions */}
              <div className="flex gap-2">
                <EventLikeButton
                  eventId={event.id}
                  isLiked={liked}
                  likeCount={event._count.likes}
                />
                <EventBookmarkButton
                  eventId={event.id}
                  isBookmarked={bookmarked}
                />
                <EventShareButton title={event.title} slug={event.slug} />
              </div>

              {/* Stats */}
              <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground pt-2">
                <span className="flex items-center gap-1">
                  <MessageSquare className="h-3.5 w-3.5" />
                  {event._count.comments} comments
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
