const API_URL = 'http://localhost:5000/api/Auth'; // 👈 تأكد من بورت الباك إند بتاعك

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
            let errorMsg = 'بيانات الدخول غير صحيحة';
            try {
                const errorData = await response.json();
                errorMsg = errorData.message || errorMsg;
            } catch (e) {}
            throw new Error(errorMsg);
        }

        return await response.json(); 

    } catch (error) {
        console.error("Auth Service Error:", error.message);
        throw error;
    }
};
