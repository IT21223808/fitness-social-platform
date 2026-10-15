
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import PostCard from "@/components/post/PostCard";
import {
  MapPin,
  CalendarDays,
  Settings,
  Dumbbell,
  Flame,
  Users,
  X,
  Check,
  Loader2,
  Camera,
  ImagePlus,
} from "lucide-react";
import { apiRequest } from "@/lib/api";

type User = {
  id: number;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  coverImageUrl?: string;
  profileImageUrl?: string;
  location?: string;
  createdAt?: string;
};

type WorkoutExercise = {
  id: number;
  exerciseName: string;
  sets: number;
  reps: number;
  duration?: number;
};

type WorkoutPlan = {
  id: number;
  userId: number;
  username: string;
  title: string;
  description?: string;
  imageUrl?: string;
  exercises: WorkoutExercise[];
  createdAt: string;
  updatedAt?: string;
};

type Meal = {
  id: number;
  mealName: string;
  foodName: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fats?: number;
};

type MealPlan = {
  id: number;
  userId: number;
  username: string;
  title: string;
  description?: string;
  imageUrl?: string;
  meals: Meal[];
  createdAt: string;
  updatedAt?: string;
};

type Post = {
  id: number;
  userId: number;
  username: string;
  description: string;
  type: string;
  createdAt: string;
  updatedAt?: string;
  media?: {
    id: number;
    mediaUrl: string;
    mediaType: string;
    displayOrder: number;
  }[];
  workoutPlan?: WorkoutPlan;
  mealPlan?: MealPlan;
};

const MAX_IMAGE_SIZE = 10 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
];

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);

  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [bio, setBio] = useState("");

  const [profileImage, setProfileImage] = useState("");
  const [coverImage, setCoverImage] = useState("");

  const [uploadingProfileImage, setUploadingProfileImage] =
    useState(false);
  const [uploadingCoverImage, setUploadingCoverImage] =
    useState(false);

  async function loadProfile() {
    try {
      setLoading(true);
      setError("");

      const currentUser = await apiRequest<User>("/users/me");

      setUser(currentUser);
      setFirstName(currentUser.firstName || "");
      setLastName(currentUser.lastName || "");
      setBio(currentUser.bio || "");
      setProfileImage(currentUser.profileImageUrl || "");
      setCoverImage(currentUser.coverImageUrl || "");

      const [followersCount, followingCount, allPosts] =
        await Promise.all([
          apiRequest<number>(
            `/users/${currentUser.id}/followers/count`
          ),
          apiRequest<number>(
            `/users/${currentUser.id}/following/count`
          ),
          apiRequest<Post[]>("/posts"),
        ]);

      setFollowers(followersCount);
      setFollowing(followingCount);

      setPosts(
        allPosts.filter(
          (post) => post.userId === currentUser.id
        )
      );
    } catch (err) {
      console.error("Failed to load profile:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load profile"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProfile();
  }, []);

  function validateImage(file: File): string | null {
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return "Choose a JPG, PNG, WEBP or GIF image.";
    }

    if (file.size > MAX_IMAGE_SIZE) {
      return "Image size cannot exceed 10 MB.";
    }

    return null;
  }

  async function handleImageUpload(
    file: File,
    imageType: "profile" | "cover"
  ) {
    setUploadError("");
    setSuccessMessage("");

    const validationError = validateImage(file);

    if (validationError) {
      setUploadError(validationError);
      return;
    }

    const isProfileImage = imageType === "profile";

    if (isProfileImage) {
      setUploadingProfileImage(true);
    } else {
      setUploadingCoverImage(true);
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const endpoint = isProfileImage
        ? "/users/me/profile-image"
        : "/users/me/cover-image";

      const imageUrl = await apiRequest<string>(endpoint, {
        method: "POST",
        body: formData,
      });

      const savedImageUrl = imageUrl.trim();

      if (!savedImageUrl) {
        throw new Error("The server did not return an image URL.");
      }

      if (isProfileImage) {
        setProfileImage(savedImageUrl);
      } else {
        setCoverImage(savedImageUrl);
      }

      setUser((currentUser) => {
        if (!currentUser) return currentUser;

        return isProfileImage
          ? { ...currentUser, profileImageUrl: savedImageUrl }
          : { ...currentUser, coverImageUrl: savedImageUrl };
      });

      setSuccessMessage(
        isProfileImage
          ? "Profile image updated successfully."
          : "Cover image updated successfully."
      );
    } catch (err) {
      console.error("Image upload failed:", err);
      setUploadError(
        err instanceof Error
          ? err.message
          : "Image upload failed. Please try again."
      );
    } finally {
      setUploadingProfileImage(false);
      setUploadingCoverImage(false);
    }
  }

  async function handleSaveProfile() {
    try {
      setSaving(true);
      setFormError("");
      setSuccessMessage("");

      const updatedUser = await apiRequest<User>("/users/me", {
        method: "PUT",
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          profileImageUrl: profileImage,
          coverImageUrl: coverImage,
          bio: bio.trim(),
        }),
      });

      setUser(updatedUser);
      setFirstName(updatedUser.firstName || "");
      setLastName(updatedUser.lastName || "");
      setBio(updatedUser.bio || "");
      setProfileImage(updatedUser.profileImageUrl || "");
      setCoverImage(updatedUser.coverImageUrl || "");
      setEditing(false);
      setSuccessMessage("Profile details saved successfully.");
    } catch (err) {
      console.error("Failed to update profile:", err);
      setFormError(
        err instanceof Error
          ? err.message
          : "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0F17] pt-20 lg:pt-0">
        <Sidebar />
        <div className="lg:pl-64">
          <Header />
          <main className="flex min-h-[80vh] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-[#27303D] border-t-[#10B981]" />
              <p className="mt-3 text-sm text-slate-500">
                Loading profile...
              </p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-[#0B0F17]">
        <Sidebar />
        <div className="lg:pl-64">
          <Header />
          <main className="flex min-h-[80vh] items-center justify-center px-6">
            <div className="text-center">
              <p className="text-sm text-red-400">
                {error || "Profile not found"}
              </p>
              <button
                type="button"
                onClick={() => router.push("/")}
                className="mt-4 rounded-xl bg-[#10B981] px-4 py-2.5 text-sm font-semibold text-white"
              >
                Go Home
              </button>
            </div>
          </main>
        </div>
      </div>
    );
  }

  const fullName =
    `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
    user.username;

  const initial =
    user.firstName?.charAt(0).toUpperCase() ||
    user.username?.charAt(0).toUpperCase() ||
    "U";

  const joinedYear = user.createdAt
    ? new Date(user.createdAt).getFullYear()
    : new Date().getFullYear();

  const backendBaseUrl = (
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api"
  ).replace(/\/api\/?$/, "");

  function resolveImageUrl(imageUrl: string) {
    if (
      imageUrl.startsWith("http://") ||
      imageUrl.startsWith("https://") ||
      imageUrl.startsWith("data:")
    ) {
      return imageUrl;
    }

    return `${backendBaseUrl}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
  }

  const displayedProfileImage = profileImage
    ? resolveImageUrl(profileImage)
    : "";

  const displayedCoverImage = coverImage
    ? resolveImageUrl(coverImage)
    : "";

  return (
    <div className="min-h-screen bg-[#0B0F17]">
      <Sidebar />

      <div className="lg:pl-64">
        <Header />

        <main className="p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            <section className="overflow-hidden rounded-2xl border border-[#27303D] bg-[#141A23]">
              {/* Cover image */}
              <div className="relative h-40 overflow-hidden bg-gradient-to-r from-[#10B981]/30 via-[#14B8A6]/20 to-[#84CC16]/20 sm:h-52">
                {displayedCoverImage && (
                  <img
                    src={displayedCoverImage}
                    alt="Profile cover"
                    className="h-full w-full object-cover"
                  />
                )}

                {editing && (
                  <label className="absolute right-4 top-4 inline-flex cursor-pointer items-center gap-2 rounded-xl border border-white/20 bg-black/60 px-3 py-2 text-sm font-medium text-white backdrop-blur transition hover:bg-black/80">
                    {uploadingCoverImage ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <ImagePlus size={16} />
                    )}
                    {uploadingCoverImage
                      ? "Uploading..."
                      : "Change cover"}
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="hidden"
                      disabled={uploadingCoverImage || saving}
                      onChange={(event) => {
                        const file = event.target.files?.[0];
                        event.target.value = "";

                        if (file) {
                          void handleImageUpload(file, "cover");
                        }
                      }}
                    />
                  </label>
                )}
              </div>

              <div className="px-6 pb-6">
                <div className="-mt-14 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                  <div className="flex items-end gap-4">
                    {/* Profile avatar */}
                    <div className="relative flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-4 border-[#141A23] bg-[#10B981]/20 text-3xl font-bold text-[#10B981]">
                      {displayedProfileImage ? (
                        <img
                          src={displayedProfileImage}
                          alt={fullName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        initial
                      )}

                      {editing && (
                        <label
                          title="Change profile image"
                          className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/55 text-white opacity-0 transition hover:opacity-100 focus-within:opacity-100"
                        >
                          {uploadingProfileImage ? (
                            <Loader2
                              size={22}
                              className="animate-spin"
                            />
                          ) : (
                            <Camera size={22} />
                          )}
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/gif"
                            className="hidden"
                            disabled={uploadingProfileImage || saving}
                            onChange={(event) => {
                              const file = event.target.files?.[0];
                              event.target.value = "";

                              if (file) {
                                void handleImageUpload(file, "profile");
                              }
                            }}
                          />
                        </label>
                      )}
                    </div>

                    <div className="pb-1">
                      <h1 className="text-2xl font-bold text-white">
                        {fullName}
                      </h1>
                      <p className="mt-1 text-sm text-slate-500">
                        @{user.username}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setFormError("");
                      setUploadError("");
                      setSuccessMessage("");
                      setFirstName(user.firstName || "");
                      setLastName(user.lastName || "");
                      setBio(user.bio || "");
                      setProfileImage(user.profileImageUrl || "");
                      setCoverImage(user.coverImageUrl || "");
                      setEditing(true);
                    }}
                    className="flex items-center gap-2 rounded-xl border border-[#27303D] bg-[#0B0F17] px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-[#10B981] hover:text-[#10B981]"
                  >
                    <Settings className="h-4 w-4" />
                    Edit Profile
                  </button>
                </div>

                {uploadError && (
                  <div
                    role="alert"
                    className="mt-4 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300"
                  >
                    {uploadError}
                  </div>
                )}

                {successMessage && (
                  <div
                    role="status"
                    className="mt-4 rounded-xl border border-[#10B981]/20 bg-[#10B981]/10 px-3 py-2 text-sm text-[#6EE7B7]"
                  >
                    {successMessage}
                  </div>
                )}

                {editing && (
                  <div className="mt-6 rounded-2xl border border-[#27303D] bg-[#0B0F17] p-5">
                    <div className="mb-4 flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-white">
                        Edit profile
                      </h2>

                      <button
                        type="button"
                        onClick={() => {
                          setEditing(false);
                          setFormError("");
                          setFirstName(user.firstName || "");
                          setLastName(user.lastName || "");
                          setBio(user.bio || "");
                        }}
                        className="rounded-lg p-2 text-slate-400 transition hover:bg-[#1A2231] hover:text-white"
                        aria-label="Close editor"
                      >
                        <X size={16} />
                      </button>
                    </div>

                    {formError && (
                      <div
                        role="alert"
                        className="mb-4 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300"
                      >
                        {formError}
                      </div>
                    )}

                    <div className="grid gap-4 md:grid-cols-2">
                      <label className="text-sm text-slate-300">
                        <span className="mb-2 block">First name</span>
                        <input
                          value={firstName}
                          maxLength={100}
                          onChange={(event) =>
                            setFirstName(event.target.value)
                          }
                          className="w-full rounded-xl border border-[#27303D] bg-[#141A23] px-3 py-2.5 text-white outline-none placeholder:text-slate-500 focus:border-[#10B981]"
                          placeholder="First name"
                        />
                      </label>

                      <label className="text-sm text-slate-300">
                        <span className="mb-2 block">Last name</span>
                        <input
                          value={lastName}
                          maxLength={100}
                          onChange={(event) =>
                            setLastName(event.target.value)
                          }
                          className="w-full rounded-xl border border-[#27303D] bg-[#141A23] px-3 py-2.5 text-white outline-none placeholder:text-slate-500 focus:border-[#10B981]"
                          placeholder="Last name"
                        />
                      </label>
                    </div>

                    <label className="mt-4 block text-sm text-slate-300">
                      <span className="mb-2 block">Bio</span>
                      <textarea
                        value={bio}
                        maxLength={500}
                        rows={4}
                        onChange={(event) => setBio(event.target.value)}
                        className="w-full resize-y rounded-xl border border-[#27303D] bg-[#141A23] px-3 py-2.5 text-white outline-none placeholder:text-slate-500 focus:border-[#10B981]"
                        placeholder="Share a little about yourself and your fitness journey..."
                      />
                      <span className="mt-1 block text-right text-xs text-slate-500">
                        {bio.length}/500
                      </span>
                    </label>

                    <p className="mt-4 text-xs leading-5 text-slate-500">
                      Use the camera on your profile picture or the Change
                      cover button above to upload images. JPG, PNG, WEBP
                      and GIF are supported, up to 10 MB each.
                    </p>

                    <div className="mt-5 flex flex-wrap justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(false);
                          setFormError("");
                          setFirstName(user.firstName || "");
                          setLastName(user.lastName || "");
                          setBio(user.bio || "");
                        }}
                        disabled={saving}
                        className="rounded-xl border border-[#27303D] px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:border-[#10B981] hover:text-white disabled:opacity-60"
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        onClick={() => void handleSaveProfile()}
                        disabled={
                          saving ||
                          uploadingProfileImage ||
                          uploadingCoverImage
                        }
                        className="inline-flex items-center gap-2 rounded-xl bg-[#10B981] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#0f9d74] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {saving ? (
                          <>
                            <Loader2
                              size={15}
                              className="animate-spin"
                            />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Check size={15} />
                            Save changes
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Bio */}
                <div className="mt-5 max-w-2xl">
                  <p className="whitespace-pre-wrap text-sm leading-6 text-slate-400">
                    {user.bio || "No bio added yet."}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-4 text-xs text-slate-500">
                    {user.location && (
                      <span className="flex items-center gap-1.5">
                        <MapPin className="h-4 w-4" />
                        {user.location}
                      </span>
                    )}

                    <span className="flex items-center gap-1.5">
                      <CalendarDays className="h-4 w-4" />
                      Joined {joinedYear}
                    </span>
                  </div>
                </div>

                {/* Profile stats */}
                <div className="mt-6 grid grid-cols-3 gap-3 border-t border-[#27303D] pt-5 sm:max-w-lg">
                  <div className="text-center">
                    <p className="text-xl font-bold text-white">
                      {posts.length}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Posts
                    </p>
                  </div>

                  <div className="border-x border-[#27303D] text-center">
                    <p className="text-xl font-bold text-white">
                      {followers}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Followers
                    </p>
                  </div>

                  <div className="text-center">
                    <p className="text-xl font-bold text-white">
                      {following}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Following
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Content */}
            <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_320px]">
              {/* Posts */}
              <section>
                <div className="mb-5">
                  <h2 className="text-lg font-semibold text-white">
                    Your Posts
                  </h2>
                </div>

                {posts.length === 0 ? (
                  <div className="rounded-2xl border border-[#27303D] bg-[#141A23] p-10 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#10B981]/10">
                      <Dumbbell className="h-6 w-6 text-[#10B981]" />
                    </div>

                    <h3 className="mt-4 font-semibold text-white">
                      No posts yet
                    </h3>

                    <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-500">
                      Share your workouts, meals and progress with the
                      community.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {posts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                )}
              </section>

              {/* Sidebar */}
              <aside className="space-y-5">
                <div className="rounded-2xl border border-[#27303D] bg-[#141A23] p-5">
                  <h2 className="font-semibold text-white">
                    Fitness Stats
                  </h2>

                  <div className="mt-4 space-y-3">
                    <div className="flex items-center justify-between rounded-xl bg-[#0B0F17] p-3">
                      <div className="flex items-center gap-3">
                        <Dumbbell className="h-4 w-4 text-[#10B981]" />
                        <span className="text-sm text-slate-400">
                          Posts
                        </span>
                      </div>
                      <span className="font-semibold text-white">
                        {posts.length}
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-xl bg-[#0B0F17] p-3">
                      <div className="flex items-center gap-3">
                        <Flame className="h-4 w-4 text-[#84CC16]" />
                        <span className="text-sm text-slate-400">
                          Followers
                        </span>
                      </div>
                      <span className="font-semibold text-white">
                        {followers}
                      </span>
                    </div>

                    <div className="flex items-center justify-between rounded-xl bg-[#0B0F17] p-3">
                      <div className="flex items-center gap-3">
                        <Users className="h-4 w-4 text-[#14B8A6]" />
                        <span className="text-sm text-slate-400">
                          Following
                        </span>
                      </div>
                      <span className="font-semibold text-white">
                        {following}
                      </span>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
