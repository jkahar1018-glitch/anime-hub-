const API_URL = "https://graphql.anilist.co";

type Variables = Record<string, unknown>;

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
  }, 12000);

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

      /*
       * Cache AniList results for 5 minutes.
       */
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

    return json.data;
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
   COMMON ANIME FIELDS
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
   TRENDING ANIME
========================================================= */

export async function getTrendingAnime(
  perPage = 14
) {
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

  return data?.Page?.media ?? [];
}

/* =========================================================
   TOP RATED ANIME
========================================================= */

export async function getTopRatedAnime(
  perPage = 14
) {
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

  return data?.Page?.media ?? [];
}

/* =========================================================
   LATEST / AIRING ANIME
========================================================= */

export async function getLatestAnime(
  perPage = 14
) {
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

  return data?.Page?.media ?? [];
}

/* =========================================================
   POPULAR ANIME
========================================================= */

export async function getPopularAnime(
  perPage = 14
) {
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

  return data?.Page?.media ?? [];
}

/* =========================================================
   ANIME CATALOG / BROWSE
========================================================= */

export async function getAnimeCatalog(
  page = 1,
  perPage = 24,
  genre?: string
) {
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
      page,
      perPage,
      genre: genre || undefined,
    }
  );

  return {
    pageInfo:
      data?.Page?.pageInfo ?? {
        currentPage: page,
        hasNextPage: false,
        lastPage: page,
        total: 0,
      },

    media: data?.Page?.media ?? [],
  };
}

/* =========================================================
   SEARCH ANIME
========================================================= */

export async function searchAnime(
  search: string
) {
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

  return data?.Page?.media ?? [];
}

/* =========================================================
   ANIME DETAILS + TRAILER
========================================================= */

export async function getAnimeById(
  id: number
) {
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