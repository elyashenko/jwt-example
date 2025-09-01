#!/bin/bash

# Скрипт для тестирования JWT API
# Убедитесь, что сервер запущен на порту 3000

BASE_URL="http://localhost:3000/api/auth"
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🧪 Testing JWT API Endpoints${NC}"
echo "=================================="

# Тест 1: Регистрация пользователя
echo -e "\n${BLUE}1. Testing User Registration${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "TestPass123!",
    "role": "user"
  }')

echo "Response: $REGISTER_RESPONSE"

# Извлекаем access token из ответа (если регистрация успешна)
ACCESS_TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)

if [ -n "$ACCESS_TOKEN" ]; then
    echo -e "${GREEN}✅ Registration successful, got access token${NC}"
    
    # Тест 2: Получение профиля (защищенный endpoint)
    echo -e "\n${BLUE}2. Testing Protected Profile Endpoint${NC}"
    PROFILE_RESPONSE=$(curl -s -X GET "$BASE_URL/profile" \
      -H "Authorization: Bearer $ACCESS_TOKEN")
    
    echo "Profile Response: $PROFILE_RESPONSE"
    
    # Тест 3: Обновление профиля
    echo -e "\n${BLUE}3. Testing Profile Update${NC}"
    UPDATE_RESPONSE=$(curl -s -X PUT "$BASE_URL/profile" \
      -H "Authorization: Bearer $ACCESS_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{
        "email": "updated@example.com"
      }')
    
    echo "Update Response: $UPDATE_RESPONSE"
    
else
    echo -e "${RED}❌ Registration failed or no access token received${NC}"
fi

# Тест 4: Попытка доступа без токена
echo -e "\n${BLUE}4. Testing Unauthorized Access${NC}"
UNAUTHORIZED_RESPONSE=$(curl -s -X GET "$BASE_URL/profile")
echo "Unauthorized Response: $UNAUTHORIZED_RESPONSE"

# Тест 5: Попытка доступа с неверным токеном
echo -e "\n${BLUE}5. Testing Invalid Token Access${NC}"
INVALID_TOKEN_RESPONSE=$(curl -s -X GET "$BASE_URL/profile" \
  -H "Authorization: Bearer invalid.token.here")
echo "Invalid Token Response: $INVALID_TOKEN_RESPONSE"

echo -e "\n${BLUE}🎯 API Testing Complete!${NC}"
echo "Check the responses above to verify JWT authentication is working correctly."
