"use client";

import {
  Image,
  Video,
  Dumbbell,
  Utensils,
  Send,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { apiRequest } from "@/lib/api";

type CreatePostProps = {
  onPostCreated?: () => void;
};

type PostMode = "POST" | "WORKOUT" | "MEAL";

type CreatedPost = {
  id: number;
};

export default function CreatePost({
  onPostCreated,
}: CreatePostProps) {
  const [content, setContent] = useState("");
  const [mode, setMode] = useState<PostMode>("POST");

  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  const MAX_FILES = 3;
  const MAX_FILE_SIZE = 50 * 1024 * 1024;

  function handleModeChange(newMode: PostMode) {
    setMode(newMode);
    setError("");

    if (newMode !== "POST") {
      removeAllFiles();
    }
  }

  function handleFileSelect(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const files = Array.from(event.target.files || []);

    if (files.length === 0) {
      return;
    }

    setError("");

    const remainingSlots =
      MAX_FILES - selectedFiles.length;

    if (remainingSlots <= 0) {
      setError("A post can have maximum 3 media files.");
      event.target.value = "";
      return;
    }

    const filesToAdd = files.slice(0, remainingSlots);

    if (files.length > remainingSlots) {
      setError("A post can have maximum 3 media files.");
    }

    for (const file of filesToAdd) {
      if (file.size > MAX_FILE_SIZE) {
        setError(
          `${file.name}: File size cannot exceed 50 MB.`
        );
        event.target.value = "";
        return;
      }

      if (
        !file.type.startsWith("image/") &&
        !file.type.startsWith("video/")
      ) {
        setError(
          `${file.name}: Only image and video files are allowed.`
        );
        event.target.value = "";
        return;
      }
    }

    const newPreviewUrls = filesToAdd.map((file) =>
      URL.createObjectURL(file)
    );

    setSelectedFiles((current) => [
      ...current,
      ...filesToAdd,
    ]);

    setPreviewUrls((current) => [
      ...current,
      ...newPreviewUrls,
    ]);

    event.target.value = "";
  }

  function removeFile(index: number) {
    const previewUrl = previewUrls[index];

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    setSelectedFiles((current) =>
      current.filter((_, fileIndex) => fileIndex !== index)
    );

    setPreviewUrls((current) =>
      current.filter((_, previewIndex) => previewIndex !== index)
    );
  }

  function removeAllFiles() {
    previewUrls.forEach((url) => {
      URL.revokeObjectURL(url);
    });

    setSelectedFiles([]);
    setPreviewUrls([]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleCreatePost() {
    if (loading) {
      return;
    }

    if (
      !content.trim() &&
      selectedFiles.length === 0
    ) {
      setError(
        "Please write something or select an image/video."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      let postType = "MEDIA";

      if (mode === "WORKOUT") {
        postType = "WORKOUT_STATUS";
      }

      if (mode === "MEAL") {
        postType = "MEAL_PLAN";
      }

      /*
       * STEP 1
       * Create the post first.
       */
      const createdPost = await apiRequest<CreatedPost>(
        "/posts",
        {
          method: "POST",
          body: JSON.stringify({
            description: content.trim(),
            type: postType,
          }),
        }
      );

      console.log(
        "Created post response:",
        createdPost
      );

      /*
       * Make sure backend returned a post ID.
       */
      if (!createdPost?.id) {
        throw new Error(
          "Post was created, but the post ID was not returned."
        );
      }

      /*
       * STEP 2
       * Upload all selected image/video files.
       */
      if (
        selectedFiles.length > 0 &&
        mode === "POST"
      ) {
        for (
          let index = 0;
          index < selectedFiles.length;
          index++
        ) {
          const file = selectedFiles[index];

          console.log(
            `Uploading media ${index + 1}/${selectedFiles.length}:`,
            file.name
          );

          const formData = new FormData();

          formData.append("file", file);

          formData.append(
            "displayOrder",
            String(index + 1)
          );

          const mediaResponse =
            await apiRequest<string>(
              `/posts/${createdPost.id}/media`,
              {
                method: "POST",
                body: formData,
              }
            );

          console.log(
            `Media ${index + 1} upload response:`,
            mediaResponse
          );
        }
      }

      /*
       * STEP 3
       * Reset composer.
       */
      setContent("");
      setMode("POST");
      removeAllFiles();

      /*
       * STEP 4
       * Tell Home page to reload the feed.
       */
      onPostCreated?.();

    } catch (error) {
      console.error(
        "Create post failed:",
        error
      );

      setError(
        error instanceof Error
          ? error.message
          : "Failed to create post"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-[#27303D] bg-[#141A23] p-4 sm:p-5">

      <div className="flex items-start gap-3">

        {/* Avatar */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#10B981]/20 font-semibold text-[#10B981] sm:h-11 sm:w-11">
          J
        </div>

        <div className="min-w-0 flex-1">

          {/* Textarea */}
          <textarea
            value={content}
            onChange={(e) => {
              if (e.target.value.length <= 500) {
                setContent(e.target.value);
              }
            }}
            placeholder={
              mode === "WORKOUT"
                ? "Share your workout..."
                : mode === "MEAL"
                  ? "Share your meal..."
                  : "Share your fitness journey..."
            }
            rows={3}
            className="w-full resize-none rounded-xl border border-[#27303D] bg-[#0B0F17] p-3.5 text-sm leading-6 text-white outline-none placeholder:text-slate-500 focus:border-[#10B981] sm:p-4"
          />

          {/* Media Preview */}
          {selectedFiles.length > 0 && (
            <div className="mt-3 space-y-3">

              {selectedFiles.map(
                (file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="relative overflow-hidden rounded-xl border border-[#27303D] bg-[#0B0F17]"
                  >

                    {file.type.startsWith(
                      "image/"
                    ) ? (
                      <img
                        src={previewUrls[index]}
                        alt={`Selected media ${index + 1}`}
                        className="max-h-[400px] w-full object-contain"
                      />
                    ) : (
                      <video
                        src={previewUrls[index]}
                        controls
                        className="max-h-[400px] w-full"
                      />
                    )}

                    <div className="absolute left-2 top-2 rounded-lg bg-black/70 px-2 py-1 text-xs text-white">
                      {index + 1}/
                      {selectedFiles.length}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        removeFile(index)
                      }
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white transition hover:bg-black"
                    >
                      <X className="h-4 w-4" />
                    </button>

                  </div>
                )
              )}

            </div>
          )}

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Actions */}
          <div className="mt-4 flex flex-wrap gap-1.5 sm:gap-2">

            {/* Photo */}
            <button
              type="button"
              onClick={() => {
                setMode("POST");
                fileInputRef.current?.click();
              }}
              disabled={
                loading ||
                selectedFiles.length >= MAX_FILES
              }
              className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-400 transition hover:bg-[#1A212C] hover:text-[#10B981] disabled:cursor-not-allowed disabled:opacity-40 sm:px-3"
            >
              <Image className="h-4 w-4" />
              Photo
            </button>

            {/* Video */}
            <button
              type="button"
              onClick={() => {
                setMode("POST");
                fileInputRef.current?.click();
              }}
              disabled={
                loading ||
                selectedFiles.length >= MAX_FILES
              }
              className="flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium text-slate-400 transition hover:bg-[#1A212C] hover:text-[#10B981] disabled:cursor-not-allowed disabled:opacity-40 sm:px-3"
            >
              <Video className="h-4 w-4" />
              Video
            </button>

            {/* Workout */}
            <button
              type="button"
              onClick={() =>
                handleModeChange("WORKOUT")
              }
              disabled={loading}
              className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-40 sm:px-3 ${
                mode === "WORKOUT"
                  ? "bg-[#10B981]/10 text-[#10B981]"
                  : "text-slate-400 hover:bg-[#1A212C] hover:text-white"
              }`}
            >
              <Dumbbell className="h-4 w-4" />
              Workout
            </button>

            {/* Meal */}
            <button
              type="button"
              onClick={() =>
                handleModeChange("MEAL")
              }
              disabled={loading}
              className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium transition disabled:cursor-not-allowed disabled:opacity-40 sm:px-3 ${
                mode === "MEAL"
                  ? "bg-[#10B981]/10 text-[#10B981]"
                  : "text-slate-400 hover:bg-[#1A212C] hover:text-white"
              }`}
            >
              <Utensils className="h-4 w-4" />
              Meal
            </button>

          </div>

          {/* File count */}
          {selectedFiles.length > 0 && (
            <p className="mt-2 text-xs text-slate-500">
              {selectedFiles.length}/
              {MAX_FILES} media selected
            </p>
          )}

          {/* Error */}
          {error && (
            <p className="mt-3 text-sm text-red-400">
              {error}
            </p>
          )}

          {/* Bottom */}
          <div className="mt-4 flex items-center justify-between border-t border-[#27303D] pt-4">

            <span className="text-xs text-slate-500">
              {content.length}/500
            </span>

            <button
              type="button"
              onClick={handleCreatePost}
              disabled={
                (!content.trim() &&
                  selectedFiles.length === 0) ||
                loading
              }
              className="flex items-center gap-2 rounded-xl bg-[#10B981] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#059669] disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Send className="h-4 w-4" />

              {loading
                ? "Posting..."
                : "Post"}
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}