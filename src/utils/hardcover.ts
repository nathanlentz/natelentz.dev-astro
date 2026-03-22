const HARDCOVER_API = "https://api.hardcover.app/v1/graphql";
const USER_ID = 62159; // From JWT token

interface Book {
	title: string;
	image: { url: string } | null;
	contributions: Array<{ author: { name: string } }>;
}

interface UserBook {
	book: Book;
	updated_at?: string;
}

interface HardcoverResponse {
	data: {
		user_books: UserBook[];
	};
}

async function fetchBooks(statusId: number, limit = 5): Promise<UserBook[]> {
	const token = import.meta.env.HARDCOVER_TOKEN;

	if (!token) {
		console.warn("HARDCOVER_TOKEN not found in environment variables");
		return [];
	}

	const query = `
    query {
      user_books(
        where: {
          user_id: {_eq: ${USER_ID}}
          status_id: {_eq: ${statusId}}
        }
        order_by: {updated_at: desc}
        limit: ${limit}
      ) {
        book {
          title
          image {
            url
          }
          contributions(where: {author_id: {_is_null: false}}) {
            author {
              name
            }
          }
        }
        updated_at
      }
    }
  `;

	try {
		const response = await fetch(HARDCOVER_API, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({ query }),
		});

		if (!response.ok) {
			const errorText = await response.text();
			console.error(`HTTP error! status: ${response.status}, body: ${errorText}`);
			return [];
		}

		const json = (await response.json()) as HardcoverResponse;

		// Log the response for debugging
		if (!json.data || !json.data.user_books) {
			console.error("Unexpected API response structure:", JSON.stringify(json, null, 2));
			return [];
		}

		return json.data.user_books;
	} catch (error) {
		console.error("Failed to fetch books from Hardcover:", error);
		return [];
	}
}

export async function getCurrentlyReading(): Promise<UserBook[]> {
	return fetchBooks(2, 3); // status_id 2 = currently reading
}

export async function getRecentlyFinished(): Promise<UserBook[]> {
	return fetchBooks(3, 3); // status_id 3 = read
}

export function getBookAuthors(book: Book): string {
	const authors = book.contributions.map((c) => c.author.name);
	if (authors.length === 0) return "Unknown Author";
	if (authors.length === 1) return authors[0];
	if (authors.length === 2) return `${authors[0]} and ${authors[1]}`;
	return `${authors[0]} et al.`;
}
