import React, { useState, useRef, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "../ui/card";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Spinner } from "../ui/spinner";
import {
  Mic,
  Square,
  Play,
  Pause,
  Save,
  Trash2,
  Download,
  AlertCircle,
} from "lucide-react";
import { offlineService } from "../../services/offlineService";

interface AudioNoteRecorderProps {
  assessmentId: string;
  roomId?: string;
  onSave?: (audioData: {
    audioBlob: Blob;
    audioUrl: string;
    caption: string;
    duration: number;
  }) => void;
}

export default function AudioNoteRecorder({
  assessmentId,
  roomId,
  onSave,
}: AudioNoteRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [caption, setCaption] = useState("");
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [networkStatus, setNetworkStatus] = useState(offlineService.isOnline());

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(() => {
    const handleNetworkChange = () => {
      setNetworkStatus(offlineService.isOnline());
    };

    window.addEventListener("online", handleNetworkChange);
    window.addEventListener("offline", handleNetworkChange);

    // Try to load previously recorded audio from local storage
    try {
      const storedAudioUrl = localStorage.getItem(
        `assessment_${assessmentId}_${roomId || ""}_audio_url`,
      );
      const storedCaption = localStorage.getItem(
        `assessment_${assessmentId}_${roomId || ""}_audio_caption`,
      );
      const storedDuration = localStorage.getItem(
        `assessment_${assessmentId}_${roomId || ""}_audio_duration`,
      );

      if (storedAudioUrl) {
        setAudioUrl(storedAudioUrl);
        if (storedCaption) setCaption(storedCaption);
        if (storedDuration) setDuration(parseFloat(storedDuration));
      }
    } catch (err) {
      console.error("Failed to load stored audio data", err);
    }

    return () => {
      window.removeEventListener("online", handleNetworkChange);
      window.removeEventListener("offline", handleNetworkChange);
      stopRecording();
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [assessmentId, roomId]);

  // Update audio player time
  useEffect(() => {
    if (!audioRef.current) return;

    const updateTime = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
      }
    };

    audioRef.current.addEventListener("timeupdate", updateTime);
    audioRef.current.addEventListener("ended", () => setIsPlaying(false));

    return () => {
      if (audioRef.current) {
        audioRef.current.removeEventListener("timeupdate", updateTime);
        audioRef.current.removeEventListener("ended", () =>
          setIsPlaying(false),
        );
      }
    };
  }, [audioUrl]);

  const startRecording = async () => {
    try {
      setError("");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        setAudioBlob(audioBlob);

        // Store in local storage
        try {
          localStorage.setItem(
            `assessment_${assessmentId}_${roomId || ""}_audio_url`,
            url,
          );
          localStorage.setItem(
            `assessment_${assessmentId}_${roomId || ""}_audio_duration`,
            duration.toString(),
          );
        } catch (err) {
          console.error("Failed to store audio data locally", err);
        }
      };

      mediaRecorder.start(100);
      setIsRecording(true);

      // Start timer
      setDuration(0);
      setCurrentTime(0);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      timerRef.current = window.setInterval(() => {
        setDuration((prev) => prev + 0.1);
      }, 100);
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError("Could not access microphone. Please check permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream
        .getTracks()
        .forEach((track) => track.stop());
      setIsRecording(false);

      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const togglePlayback = () => {
    if (!audioRef.current || !audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }

    setIsPlaying(!isPlaying);
  };

  const deleteRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    setAudioUrl(null);
    setAudioBlob(null);
    setDuration(0);
    setCurrentTime(0);
    setCaption("");

    // Remove from local storage
    try {
      localStorage.removeItem(
        `assessment_${assessmentId}_${roomId || ""}_audio_url`,
      );
      localStorage.removeItem(
        `assessment_${assessmentId}_${roomId || ""}_audio_caption`,
      );
      localStorage.removeItem(
        `assessment_${assessmentId}_${roomId || ""}_audio_duration`,
      );
    } catch (err) {
      console.error("Failed to remove audio data from local storage", err);
    }
  };

  const saveAudio = () => {
    if (!audioBlob || !audioUrl) {
      setError("No audio recording to save");
      return;
    }

    setSaving(true);

    // Store caption in local storage
    try {
      localStorage.setItem(
        `assessment_${assessmentId}_${roomId || ""}_audio_caption`,
        caption,
      );
    } catch (err) {
      console.error("Failed to store audio caption locally", err);
    }

    if (onSave) {
      onSave({
        audioBlob,
        audioUrl,
        caption,
        duration,
      });
    }

    setSaving(false);
  };

  const downloadAudio = () => {
    if (!audioBlob) return;

    const url = URL.createObjectURL(audioBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `audio-note-${assessmentId}-${roomId || ""}.webm`;
    link.click();

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);
  };

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  return (
    <Card className="mx-auto max-w-md bg-white">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="flex items-center">
            <Mic className="mr-2" /> Audio Note Recorder
          </CardTitle>
          <div className="flex items-center space-x-2">
            <div
              className={`h-3 w-3 rounded-full ${networkStatus ? "bg-green-500" : "bg-red-500"}`}
            ></div>
            <span className="text-xs">
              {networkStatus ? "Online" : "Offline"}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
            <AlertCircle className="text-red-500 mr-2 flex-shrink-0" />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Hidden audio element for playback */}
        {audioUrl && <audio ref={audioRef} src={audioUrl} className="hidden" />}

        <div className="flex flex-col items-center justify-center py-4">
          {isRecording ? (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
                <div className="w-8 h-8 rounded-full bg-red-500 animate-pulse"></div>
              </div>
              <p className="text-lg font-medium">{formatTime(duration)}</p>
              <p className="text-sm text-gray-500 mb-4">Recording...</p>
              <Button
                variant="destructive"
                onClick={stopRecording}
                className="flex items-center"
              >
                <Square size={16} className="mr-1" /> Stop Recording
              </Button>
            </div>
          ) : audioUrl ? (
            <div className="w-full space-y-4">
              <div className="flex items-center justify-center">
                <Button
                  variant={isPlaying ? "outline" : "default"}
                  onClick={togglePlayback}
                  className="flex items-center"
                >
                  {isPlaying ? (
                    <>
                      <Pause size={16} className="mr-1" /> Pause
                    </>
                  ) : (
                    <>
                      <Play size={16} className="mr-1" /> Play
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={deleteRecording}
                  className="ml-2 flex items-center"
                >
                  <Trash2 size={16} className="mr-1" /> Delete
                </Button>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500"
                    style={{ width: `${(currentTime / duration) * 100}%` }}
                  ></div>
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="audio-caption" className="text-sm font-medium">
                  Caption
                </label>
                <Input
                  id="audio-caption"
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  placeholder="Enter a caption for this audio note"
                  className="w-full"
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                <Mic size={24} className="text-blue-500" />
              </div>
              <p className="text-gray-500 mb-4 text-center">
                Record an audio note for this assessment
              </p>
              <Button onClick={startRecording} className="flex items-center">
                <Mic size={16} className="mr-1" /> Start Recording
              </Button>
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        {audioUrl && (
          <>
            <Button
              variant="outline"
              onClick={downloadAudio}
              className="flex items-center"
            >
              <Download size={16} className="mr-1" /> Download
            </Button>

            <Button onClick={saveAudio} disabled={saving}>
              {saving ? (
                <>
                  <Spinner size="sm" className="mr-2" /> Saving...
                </>
              ) : (
                <>
                  <Save size={16} className="mr-1" /> Save Audio
                </>
              )}
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}
