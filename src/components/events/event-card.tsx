import Link from "next/link"
import Image from "next/image"
import { CalendarDays, MapPin, Users, Heart, Globe } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { formatDateTime } from "@/lib/utils"
import type { EventCardData } from "@/types"

interface EventCardProps {
  event: EventCardData
}

const NEW_BADGE_WINDOW_MS = 3 * 24 * 60 * 60 * 1000 // 3 days

export function EventCard({ event }: EventCardProps) {
  const spotsLeft = event.capacity
    ? event.capacity - event._count.registrations
    : null
  const isNew = Date.now() - new Date(event.createdAt).getTime() < NEW_BADGE_WINDOW_MS

  return (
    <Link href={`/events/${event.slug}`}>
      <Card className="group overflow-hidden transition-all hover:shadow-lg hover:-translate-y-0.5">
        {/* Cover Image */}
        <div className="relative aspect-[16/9] overflow-hidden bg-muted">
          {event.coverImage ? (
            <Image
              src={event.coverImage}
              alt={event.title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
              <CalendarDays className="h-12 w-12 text-primary/40" />
            </div>
          )}
          {/* Category Badges */}
          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
            {isNew && (
              <Badge className="text-[10px] bg-emerald-600 text-white hover:bg-emerald-600">
                New
              </Badge>
            )}
            {event.categories.slice(0, 2).map(({ category }) => (
              <Badge
                key={category.id}
                variant="secondary"
                className="text-[10px] bg-background/90 backdrop-blur-sm"
                style={{ borderLeftColor: category.color || undefined, borderLeftWidth: category.color ? 3 : 0 }}
              >
                {category.name}
              </Badge>
            ))}
          </div>
          {/* Free/Paid Badge */}
          <div className="absolute top-2 right-2">
            <Badge variant={event.isFree ? "default" : "secondary"} className="text-[10px]">
              {event.isFree ? "Free" : "Paid"}
            </Badge>
          </div>
        </div>

        <CardContent className="p-4 space-y-3">
          {/* Title */}
          <h3 className="font-semibold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {event.title}
          </h3>

          {/* Summary */}
          {event.summary && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {event.summary}
            </p>
          )}

          {/* Date & Location */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{formatDateTime(event.startDate)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {event.isOnline ? (
                <>
                  <Globe className="h-3.5 w-3.5 shrink-0" />
                  <span>Online Event</span>
                </>
              ) : event.venue ? (
                <>
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{event.venue}</span>
                </>
              ) : null}
            </div>
          </div>

          {/* Footer: Organizer, Likes, Capacity */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              <span>{event._count.registrations} attending</span>
              {spotsLeft !== null && spotsLeft <= 10 && spotsLeft > 0 && (
                <span className="text-orange-600 font-medium">
                  ({spotsLeft} spots left)
                </span>
              )}
              {spotsLeft !== null && spotsLeft <= 0 && (
                <span className="text-destructive font-medium">Full</span>
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Heart className="h-3.5 w-3.5" />
              <span>{event._count.likes}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
