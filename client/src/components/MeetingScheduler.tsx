import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "lucide-react";
import { createMeeting } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import type { Meeting, Client } from "@shared/schema";

interface MeetingSchedulerProps {
  selectedClientId: string;
}

export default function MeetingScheduler({ selectedClientId }: MeetingSchedulerProps) {
  const [meetingTitle, setMeetingTitle] = useState("");
  const [meetingDateTime, setMeetingDateTime] = useState("");
  const [meetingLocation, setMeetingLocation] = useState("Google Meet");

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: meetings = [] } = useQuery<Meeting[]>({
    queryKey: ["/api/meetings"],
  });

  const { data: clients = [] } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const createMeetingMutation = useMutation({
    mutationFn: createMeeting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meetings"] });
      setMeetingTitle("");
      setMeetingDateTime("");
      setMeetingLocation("Google Meet");
      toast({
        title: "সফল",
        description: "মিটিং সফলভাবে শিডিউল করা হয়েছে",
      });
    },
    onError: () => {
      toast({
        title: "ত্রুটি",
        description: "মিটিং শিডিউল করতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    },
  });

  const handleScheduleMeeting = () => {
    if (!selectedClientId) {
      toast({
        title: "ত্রুটি",
        description: "প্রথমে একটি ক্লায়েন্ট নির্বাচন করুন",
        variant: "destructive",
      });
      return;
    }

    if (!meetingTitle.trim() || !meetingDateTime || !meetingLocation.trim()) {
      toast({
        title: "ত্রুটি",
        description: "সব ফিল্ড পূরণ করুন",
        variant: "destructive",
      });
      return;
    }

    createMeetingMutation.mutate({
      clientId: selectedClientId,
      title: meetingTitle.trim(),
      datetime: meetingDateTime,
      location: meetingLocation.trim(),
      reminders: ["1 day before", "3 hours before", "30 min before"],
    });
  };

  const upcomingMeetings = meetings
    .filter(meeting => new Date(meeting.datetime) > new Date())
    .slice(0, 3);

  return (
    <Card className="rounded-2xl shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          মিটিং শিডিউল
        </CardTitle>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-4">
        <Input
          data-testid="input-meeting-title"
          placeholder="মিটিং টাইটেল"
          value={meetingTitle}
          onChange={(e) => setMeetingTitle(e.target.value)}
        />
        
        <Input
          data-testid="input-meeting-datetime"
          type="datetime-local"
          value={meetingDateTime}
          onChange={(e) => setMeetingDateTime(e.target.value)}
        />
        
        <Input
          data-testid="input-meeting-location"
          placeholder="লোকেশন (যেমন: Google Meet)"
          value={meetingLocation}
          onChange={(e) => setMeetingLocation(e.target.value)}
        />
        
        <Button
          className="w-full"
          onClick={handleScheduleMeeting}
          disabled={createMeetingMutation.isPending}
          data-testid="button-schedule-meeting"
        >
          {createMeetingMutation.isPending ? "শিডিউল হচ্ছে..." : "মিটিং শিডিউল করুন"}
        </Button>
        
        {/* Upcoming Meetings */}
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">আসন্ন মিটিং</h4>
          <div className="space-y-2" data-testid="div-upcoming-meetings">
            {upcomingMeetings.length === 0 ? (
              <p className="text-sm text-muted-foreground" data-testid="text-no-upcoming-meetings">
                কোন আসন্ন মিটিং নেই
              </p>
            ) : (
              upcomingMeetings.map((meeting) => {
                const client = clients.find(c => c.id === meeting.clientId);
                const date = new Date(meeting.datetime);
                
                return (
                  <div 
                    key={meeting.id} 
                    className="bg-muted p-3 rounded"
                    data-testid={`card-meeting-${meeting.id}`}
                  >
                    <p className="font-medium text-sm" data-testid={`text-meeting-title-${meeting.id}`}>
                      {meeting.title}
                    </p>
                    <p className="text-xs text-muted-foreground" data-testid={`text-meeting-client-${meeting.id}`}>
                      {client?.name || 'Unknown Client'}
                    </p>
                    <p className="text-xs" data-testid={`text-meeting-date-${meeting.id}`}>
                      {date.toLocaleString('bn-BD')}
                    </p>
                    <p className="text-xs" data-testid={`text-meeting-location-${meeting.id}`}>
                      {meeting.location}
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
