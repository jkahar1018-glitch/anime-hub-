const API_URL = "https://graphql.anilist.co";

type Variables = Record<string, unknown>;

export type Anime = {
  id: number;

  title: {
    romaji: string;
    english?: string | null;
    native?: string | null;
  };

  averageScore?: number | null;
  popularity?: number | null;

  episodes?: number | null;
  duration?: number | null;

  season?: string | null;
  seasonYear?: number | null;

  status?: string | null;
  format?: string | null;

  genres?: string[];

  description?: string | null;

  bannerImage?: string | null;

  coverImage: {
    large: string;
    extraLarge?: string | null;
    medium?: string | null;
  };

  trailer?: {
    id?: string | null;
    site?: string | null;
    thumbnail?: string | null;
  } | null;
};

export type AnimeCatalogResult = {
  pageInfo: {
    currentPage: number;
    hasNextPage: boolean;
    lastPage: number;
    total: number;
  };

  media: Anime[];
};

/* =========================================================
   COMMON FIELDS
========================================================= */

const mediaFields = `
  id

  title {
    romaji
    english
    native
  }

  averageScore
  popularity

  episodes
  duration

  season
  seasonYear

  status
  format

  genres

  description(asHtml: false)

  bannerImage

  coverImage {
    large
    extraLarge
    medium
  }
`;

/* =========================================================
   ANILIST FETCH
========================================================= */

async function fetchAnime(
  query: string,
  variables: Variables = {}
) {
  const controller = new AbortController();

  const timeout = setTimeout(() => {
    controller.abort();
  }, 15000);

  try {
    const response = await fetch(API_URL, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },

      body: JSON.stringify({
        query,
        variables,
      }),

      signal: controller.signal,

      next: {
        revalidate: 300,
      },
    });

    if (!response.ok) {
      throw new Error(
        `AniList HTTP ${response.status}`
      );
    }

    const json = await response.json();

    if (json.errors) {
      console.error(
        "AniList GraphQL error:",
        json.errors
      );

      return null;
    }

    return json.data ?? null;
  } catch (error) {
    console.error(
      "AniList fetch error:",
      error
    );

    return null;
  } finally {
    clearTimeout(timeout);
  }
}

/* =========================================================
   TRENDING
========================================================= */

export async function getTrendingAnime(
  perPage = 14
): Promise<Anime[]> {
  const data = await fetchAnime(
    `
      query ($perPage: Int) {
        Page(
          page: 1
          perPage: $perPage
        ) {
          media(
            sort: TRENDING_DESC
            type: ANIME
            isAdult: false
          ) {
            ${mediaFields}
          }
        }
      }
    `,
    {
      perPage,
    }
  );

  return Array.isArray(data?.Page?.media)
    ? data.Page.media
    : [];
}

/* =========================================================
   TOP RATED
========================================================= */

export async function getTopRatedAnime(
  perPage = 14
): Promise<Anime[]> {
  const data = await fetchAnime(
    `
      query ($perPage: Int) {
        Page(
          page: 1
          perPage: $perPage
        ) {
          media(
            sort: SCORE_DESC
            type: ANIME
            isAdult: false
            averageScore_greater: 70
          ) {
            ${mediaFields}
          }
        }
      }
    `,
    {
      perPage,
    }
  );

  return Array.isArray(data?.Page?.media)
    ? data.Page.media
    : [];
}

/* =========================================================
   LATEST / AIRING
========================================================= */

export async function getLatestAnime(
  perPage = 14
): Promise<Anime[]> {
  const data = await fetchAnime(
    `
      query ($perPage: Int) {
        Page(
          page: 1
          perPage: $perPage
        ) {
          media(
            sort: UPDATED_AT_DESC
            type: ANIME
            status: RELEASING
            isAdult: false
          ) {
            ${mediaFields}
          }
        }
      }
    `,
    {
      perPage,
    }
  );

  return Array.isArray(data?.Page?.media)
    ? data.Page.media
    : [];
}

/* =========================================================
   POPULAR
========================================================= */

export async function getPopularAnime(
  perPage = 14
): Promise<Anime[]> {
  const data = await fetchAnime(
    `
      query ($perPage: Int) {
        Page(
          page: 1
          perPage: $perPage
        ) {
          media(
            sort: POPULARITY_DESC
            type: ANIME
            isAdult: false
          ) {
            ${mediaFields}
          }
        }
      }
    `,
    {
      perPage,
    }
  );

  return Array.isArray(data?.Page?.media)
    ? data.Page.media
    : [];
}

/* =========================================================
   BROWSE / CATALOG
========================================================= */

export async function getAnimeCatalog(
  page = 1,
  perPage = 24,
  genre?: string
): Promise<AnimeCatalogResult> {
  const safePage =
    Number.isFinite(page) && page > 0
      ? Math.floor(page)
      : 1;

  const safePerPage =
    Number.isFinite(perPage) &&
    perPage > 0 &&
    perPage <= 50
      ? Math.floor(perPage)
      : 24;

  const cleanGenre =
    typeof genre === "string"
      ? genre.trim()
      : "";

  const data = await fetchAnime(
    `
      query (
        $page: Int
        $perPage: Int
        $genre: String
      ) {
        Page(
          page: $page
          perPage: $perPage
        ) {
          pageInfo {
            currentPage
            hasNextPage
            lastPage
            total
          }

          media(
            sort: POPULARITY_DESC
            type: ANIME
            genre: $genre
            isAdult: false
          ) {
            ${mediaFields}
          }
        }
      }
    `,
    {
      page: safePage,
      perPage: safePerPage,
      genre: cleanGenre || undefined,
    }
  );

  return {
    pageInfo: {
      currentPage:
        data?.Page?.pageInfo?.currentPage ??
        safePage,

      hasNextPage:
        Boolean(
          data?.Page?.pageInfo?.hasNextPage
        ),

      lastPage:
        data?.Page?.pageInfo?.lastPage ??
        safePage,

      total:
        data?.Page?.pageInfo?.total ??
        0,
    },

    media: Array.isArray(data?.Page?.media)
      ? data.Page.media
      : [],
  };
}

/* =========================================================
   SEARCH
========================================================= */

export async function searchAnime(
  search: string
): Promise<Anime[]> {
  const cleanSearch = search.trim();

  if (!cleanSearch) {
    return [];
  }

  const data = await fetchAnime(
    `
      query ($search: String) {
        Page(
          page: 1
          perPage: 24
        ) {
          media(
            search: $search
            type: ANIME
            isAdult: false
            sort: SEARCH_MATCH
          ) {
            ${mediaFields}
          }
        }
      }
    `,
    {
      search: cleanSearch,
    }
  );

  return Array.isArray(data?.Page?.media)
    ? data.Page.media
    : [];
}

/* =========================================================
   ANIME DETAILS
========================================================= */

export async function getAnimeById(
  id: number
): Promise<Anime | null> {
  if (!Number.isFinite(id) || id <= 0) {
    return null;
  }

  const data = await fetchAnime(
    `
      query ($id: Int) {
        Media(
          id: $id
          type: ANIME
        ) {
          ${mediaFields}

          trailer {
            id
            site
            thumbnail
          }
        }
      }
    `,
    {
      id,
    }
  );

  return data?.Media ?? null;
}