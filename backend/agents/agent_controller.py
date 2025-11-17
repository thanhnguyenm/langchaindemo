from models.user_session import UserSession
from agents.HeinekenAgent import HeinekenAgent
from agents.AgentsEnum import AgentsEnum

import os
import dotenv
dotenv.load_dotenv()

from langchain.agents import create_agent
from langchain.tools import tool
from langchain_openai import AzureChatOpenAI
from langchain_core.messages import HumanMessage, AIMessage

AZURE_OPENAI_API_KEY = os.getenv("AZURE_OPENAI_API_KEY")
AZURE_OPENAI_ENDPOINT = os.getenv("AZURE_OPENAI_ENDPOINT")
OPENAI_API_VERSION = os.getenv("OPENAI_API_VERSION", "2025-03-01-preview")
AZURE_OPENAI_DEPLOYMENT_NAME = os.getenv("AZURE_OPENAI_DEPLOYMENT_NAME", "gpt-4.1")
AZURE_OPENAI_MODEL_NAME = os.getenv("AZURE_OPENAI_MODEL_NAME", "gpt-4.1")

FreddyAI_Assistant = None
BWCS_Agent = None
Performance_Agent = None
Reality_Agent = None
Telescope_Agent = None
Trends_Agent = None
Taste_Landscape_Agent = None   


def get_simple_agent():
    chat_model = AzureChatOpenAI(
        model=AZURE_OPENAI_MODEL_NAME,
        azure_deployment=AZURE_OPENAI_DEPLOYMENT_NAME
    )
    
    agent_controller = create_agent(
        name=AgentsEnum.FREDDYAI_ASSISTANT.value,
        model=chat_model, 
        tools=[]
    )
        
    return agent_controller
  
def get_agent_controller(user_session: UserSession):
    user_session = user_session
    agent_controller = None
    
    chat_model = AzureChatOpenAI(
        model=AZURE_OPENAI_MODEL_NAME,
        azure_deployment=AZURE_OPENAI_DEPLOYMENT_NAME
    )

    agent_tools = []
        
    if user_session and user_session.session_agents:
        for agent_info in user_session.session_agents:
            agent_id = agent_info.get("agent_id")
            agent_code = agent_info.get("agent_code")
            system_prompt = agent_info.get("agent_system_prompt", "")
            
            if agent_code == AgentsEnum.FREDDYAI_ASSISTANT.value:
                continue  # Skip FreddyAI Assistant for now
            
            tools = []  # Replace with actual tools list
            agent_instance = HeinekenAgent(agent_code, chat_model, tools, system_prompt)
            
            if agent_code == AgentsEnum.BWCS_AGENT.value:
                print("Initializing BWCS Agent")
                global BWCS_Agent
                BWCS_Agent = agent_instance
                agent_tools.append(call_BWCS_Agent)
            elif agent_code == AgentsEnum.PERFORMANCE_AGENT.value:
                print("Initializing Performance Agent")
                global Performance_Agent
                Performance_Agent = agent_instance
                agent_tools.append(call_Performance_Agent)
            elif agent_code == AgentsEnum.REALITY_AGENT.value:
                print("Initializing Reality Agent")
                global Reality_Agent
                Reality_Agent = agent_instance
                agent_tools.append(call_Reality_Agent)
            elif agent_code == AgentsEnum.TELESCOPE_AGENT.value:
                print("Initializing Telescope Agent")
                global Telescope_Agent
                Telescope_Agent = agent_instance
                agent_tools.append(call_Telescope_Agent)
            elif agent_code == AgentsEnum.TRENDS_AGENT.value:
                print("Initializing Trends Agent")
                global Trends_Agent
                Trends_Agent = agent_instance
                agent_tools.append(call_Trends_Agent)
            elif agent_code == AgentsEnum.TASTE_LANDSCAPE_AGENT.value:
                print("Initializing Taste Landscape Agent")
                global Taste_Landscape_Agent
                Taste_Landscape_Agent = agent_instance
                agent_tools.append(call_Taste_Landscape_Agent)

    print("Creating FreddyAI Assistant with tools:", len(agent_tools))
    agent_controller = create_agent(
        name=AgentsEnum.FREDDYAI_ASSISTANT.value,
        model=chat_model, 
        tools=agent_tools
    )
        
    return agent_controller
  
@tool(
  AgentsEnum.REALITY_AGENT.value,
  description="""
    Use this tool to interact with Reality Agent.
    Reality Agent is designed to provide insights and information about the real world.
    Input should be a string query or command for Reality Agent.
  """
)
def call_Reality_Agent(query: str):
    from langchain_core.messages import HumanMessage
    print("Calling Reality Agent with query:", query)
    global Reality_Agent
    result = Reality_Agent.get_agent().invoke({
        "messages": [HumanMessage(content=query)]
    })
    return result

@tool(
  AgentsEnum.PERFORMANCE_AGENT.value,
  description="""
    Use this tool to interact with Performance Agent.
    Performance Agent is designed to provide insights and information about system performance.
    Input should be a string query or command for Performance Agent.
  """
)
def call_Performance_Agent(query: str):
    from langchain_core.messages import HumanMessage
    print("Calling Performance Agent with query:", query)
    global Performance_Agent
    result = Performance_Agent.get_agent().invoke({
        "messages": [HumanMessage(content=query)]
    })
    return result
  
@tool(
  AgentsEnum.TELESCOPE_AGENT.value,
  description="""
    Use this tool to interact with Telescope Agent.
    Telescope Agent is designed to provide insights and information about astronomical data.
    Input should be a string query or command for Telescope Agent.
  """
)
def call_Telescope_Agent(query: str):
    from langchain_core.messages import HumanMessage
    print("Calling Telescope Agent with query:", query)
    global Telescope_Agent
    result = Telescope_Agent.get_agent().invoke({
        "messages": [HumanMessage(content=query)]
    })
    return result
  
  
@tool(
  AgentsEnum.TRENDS_AGENT.value,
  description="""
    Use this tool to interact with Trends Agent.
    Trends Agent is designed to provide insights and information about market trends.
    Input should be a string query or command for Trends Agent.
  """
)
def call_Trends_Agent(query: str):
    from langchain_core.messages import HumanMessage
    print("Calling Trends Agent with query:", query)
    global Trends_Agent
    result = Trends_Agent.get_agent().invoke({
        "messages": [HumanMessage(content=query)]
    })
    return result
  
@tool(
  AgentsEnum.TASTE_LANDSCAPE_AGENT.value,
  description="""
    Use this tool to interact with Taste Landscape Agent.
    Taste Landscape Agent is designed to provide insights and information about taste preferences and trends.
    Input should be a string query or command for Taste Landscape Agent.
  """
)
def call_Taste_Landscape_Agent(query: str):
    from langchain_core.messages import HumanMessage
    print("Calling Taste Landscape Agent with query:", query)
    global Taste_Landscape_Agent
    result = Taste_Landscape_Agent.get_agent().invoke({
        "messages": [HumanMessage(content=query)]
    })
    return result
  
  
@tool(
  AgentsEnum.BWCS_AGENT.value,
  description="""
    Use this tool to interact with BWCS Agent.
    BWCS Agent is designed to provide insights and information about business workflows and collaboration systems.
    Input should be a string query or command for BWCS Agent.
  """
)
def call_BWCS_Agent(query: str):
    from langchain_core.messages import HumanMessage
    print("Calling BWCS Agent with query:", query)
    global BWCS_Agent
    result = BWCS_Agent.get_agent().invoke({
        "messages": [HumanMessage(content=query)]
    })
    return result
