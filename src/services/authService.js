const API_URL = 'https://elwarshaback-production.up.railway.app/api/Auth'; // 👈 تأكد من بورت الباك إند بتاعك

export const loginUser = async (username, password) => {
    try {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'بيانات الدخول غير صحيحة');
        }

        return await response.json();

    } catch (error) {
        console.error("Auth Service Error:", error.message);
        throw error;
    }
};