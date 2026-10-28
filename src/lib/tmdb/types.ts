// Kiểu JSON thô của TMDB, chỉ khai các trường dùng tới.

export type TmdbListItem = {
  id: number;
  title?: string;
  original_title: string;
  original_language: string;
  adult?: boolean;
  overview?: string;
  release_date?: string;
  genre_ids?: number[];
  poster_path: string | null;
  backdrop_path: string | null;
  popularity?: number;
  vote_average?: number;
  vote_count?: number;
};

export type TmdbPaged<T> = {
  page: number;
  total_pages: number;
  total_results: number;
  results: T[];
  dates?: { minimum: string; maximum: string }; // chỉ now_playing/upcoming
};

export type TmdbVideo = {
  key: string;
  site: string;
  type: string;
  official: boolean;
  iso_639_1: string | null;
  name: string;
  published_at?: string;
};

export type TmdbImage = { file_path: string; iso_639_1: string | null; vote_average: number };

export type TmdbReleaseDates = {
  results: {
    iso_3166_1: string;
    release_dates: { certification: string; note: string; release_date: string; type: number }[];
  }[];
};

export type TmdbProvider = { provider_id: number; provider_name: string; logo_path: string | null };

export type TmdbWatchProviders = {
  results: Record<
    string,
    {
      link?: string;
      flatrate?: TmdbProvider[];
      free?: TmdbProvider[];
      ads?: TmdbProvider[];
      rent?: TmdbProvider[];
      buy?: TmdbProvider[];
    }
  >;
};

export type TmdbReview = {
  id: string;
  author: string;
  author_details?: { username?: string; rating?: number | null };
  content: string;
  created_at: string;
  url: string;
};

// Một phim trong movie_credits của người (kèm vai/việc làm). Giữ đủ trường của list item để tái dùng toCard.
export type TmdbMovieCredit = TmdbListItem & { character?: string; job?: string; department?: string };

export type TmdbPersonFull = {
  id: number;
  name: string;
  biography?: string;
  profile_path: string | null;
  known_for_department?: string;
  birthday?: string | null;
  deathday?: string | null;
  place_of_birth?: string | null;
  movie_credits?: { cast?: TmdbMovieCredit[]; crew?: TmdbMovieCredit[] };
  external_ids?: { imdb_id?: string | null };
};

// Một người trong kết quả /search/person.
export type TmdbPersonListItem = {
  id: number;
  name: string;
  profile_path: string | null;
  known_for_department?: string;
  popularity?: number;
  adult?: boolean;
};

export type TmdbMovieFull = TmdbListItem & {
  runtime?: number | null;
  tagline?: string | null;
  genres?: { id: number; name: string }[];
  origin_country?: string[];
  production_countries?: { iso_3166_1: string; name: string }[];
  spoken_languages?: { iso_639_1: string }[];
  belongs_to_collection?: { name: string } | null;
  budget?: number;
  revenue?: number;
  imdb_id?: string | null;
  credits?: {
    cast: { id: number; name: string; original_name?: string; character?: string; order: number; profile_path: string | null }[];
    crew: { id: number; name: string; original_name?: string; job: string; profile_path: string | null }[];
  };
  videos?: { results: TmdbVideo[] };
  images?: { posters: TmdbImage[]; logos: TmdbImage[]; backdrops: TmdbImage[] };
  release_dates?: TmdbReleaseDates;
  keywords?: { keywords: { id: number; name: string }[] };
  similar?: TmdbPaged<TmdbListItem>;
  recommendations?: TmdbPaged<TmdbListItem>;
  reviews?: TmdbPaged<TmdbReview>;
  "watch/providers"?: TmdbWatchProviders;
  external_ids?: { imdb_id?: string | null };
};
