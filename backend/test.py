import os
from unittest import result
import ast
import dotenv
dotenv.load_dotenv()

from langchain.chat_models import init_chat_model



AZURE_OPENAI_API_KEY = os.getenv("AZURE_OPENAI_API_KEY")
AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
OPENAI_API_VERSION = os.getenv("OPENAI_API_VERSION", "2023-03-15-preview")
AZURE_OPENAI_DEPLOYMENT_NAME = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME", "gpt-4.1")
AZURE_OPENAI_MODEL_NAME = os.getenv("AZURE_OPENAI_MODEL_NAME", "gpt-4.1")

# chat_model = init_chat_model(
#     f"azure_openai:{AZURE_OPENAI_MODEL_NAME}",
#     azure_deployment=AZURE_OPENAI_DEPLOYMENT_NAME
# )

# response = chat_model.invoke("Why do parrots talk?")

# #print("Chat Model Response:", response)

# token_count = 0
# for chunk in chat_model.stream("Why do parrots have colorful feathers?"):
#   if chunk.usage_metadata is not None and 'total_tokens' in chunk.usage_metadata:
#       token_count += chunk.usage_metadata['total_tokens']
#   elif hasattr(chunk, 'content'):
#       print(chunk.content, end="|", flush=True)

# print(f"\nTotal tokens used: {token_count}")


import agents.agent_controller
from utils.user_util import load_session

user_session = load_session('user@heineken.com');
#print all properties of user_session
# print("User Session:", user_session.session_id)
# print("User Email:", user_session.user_email)
# print("Agents:", user_session.session_agents)

from agents.AgentsEnum import AgentsEnum
from langchain_core.messages import HumanMessage, AIMessage
agent_controller = agents.agent_controller.get_agent_controller(user_session)
token_count = 0
for chunk in agent_controller.stream(
    {"messages": [{"role": "user", "content": "What is performance of Heineken in Vietnam?"}]},
    stream_mode="updates"
):
    for step, data in chunk.items():
        # print(f"step: {step}")
        # print(f"content: {data['messages'][-1].content_blocks}")
        
        message = data['messages'][-1]
        if step == "model":
            agent_name = AgentsEnum.FREDDYAI_ASSISTANT.value
            if message.content:
                print(f"{agent_name}:")
                print(f"{message.content}")
                print(f"tokens: {message.usage_metadata['total_tokens']}")
        else:
            agent_name = message.name
            # Parse the string content to extract AIMessage content
            try:
                # Use eval() to parse the string containing Python objects
                # Note: This is safe here since we control the content source
                
                content_dict = eval(message.content)
                
                # Extract AIMessage content from the parsed dictionary
                if 'messages' in content_dict:
                    # Get the last message which should be the AIMessage
                    # for msg in content_dict['messages']:
                    #     if isinstance(msg, AIMessage):
                    #         print(f"AI Response: {msg.content}")
                        # elif isinstance(msg, HumanMessage):
                        #     print(f"Human Message: {msg.content}")
                    aiMessage = content_dict['messages'][-1]
                    msg = aiMessage.content
                    print(f"{agent_name}:")
                    print(f"{msg}")
                    print(f"tokens: {aiMessage.response_metadata['token_usage']['total_tokens']}")
            except Exception as e:
                # If parsing fails, just print the raw content
                print(f"Error: {e}")
                print(f"{message.content}")

        # Check if message.content is a string (which it should be for AIMessage)
        # if isinstance(message.content, str):
        #     print(f"{message.content}")
        # elif hasattr(message.content, 'get') and 'messages' in message.content:
        #     # Handle case where content might be a dict with messages
        #     for msg in message.content['messages']:
        #         if isinstance(msg, AIMessage):
        #             print(f"{msg.content}")
        # else:
        #     print(f"{message.content}")
        
        # for content_block in message.content_blocks:
        #     if content_block['type'] == 'text':
        #         text_content = content_block['text'] 
        #         if 'messages' in text_content:
        #             print(text_content)
        #         else:
        #             print(text_content)
        
simple_agent = agents.agent_controller.get_simple_agent()
response = simple_agent.invoke(
    {"messages": [{"role": "user", "content": "Provide a brief summary of Heineken's performance in Vietnam."}]}
)
print("Simple Agent Response:", response)

messages = response['messages'][-1]
message = messages.content
print("Message Content:", message)