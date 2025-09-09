token ="AIzaSyD0Zea1gCEd8niseu4K9ofF0Sj633ZCai4"

# example
from google import genai

# The client gets the API key from the environment variable `GEMINI_API_KEY`.
client = genai.Client(api_key=token)

response = client.models.generate_content(
    model="gemini-2.5-pro", contents="Explain how AI works in a few words"
)
print(response.text)

# Stream Conversation
from google import genai

client = genai.Client()
chat = client.chats.create(model="gemini-2.5-flash")

response = chat.send_message_stream("I have 2 dogs in my house.")
for chunk in response:
    print(chunk.text, end="")

response = chat.send_message_stream("How many paws are in my house?")
for chunk in response:
    print(chunk.text, end="")

for message in chat.get_history():
    print(f'role - {message.role}', end=": ")
    print(message.parts[0].text)

