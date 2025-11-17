from langchain.agents import create_agent

class HeinekenAgent:
    def __init__(self, name, chat_model, tools, system_prompt):
        """
        Initialize the Research Agent with a language model and tools.
        
        Args:
            llm: The language model to use (e.g., OpenAI, Azure OpenAI)
            tools: A list of tools the agent can use (e.g., search, database query)
        """
        self.agent = create_agent(
            name=name,
            model=chat_model,
            tools=tools,
            system_prompt=system_prompt,
            #middleware=[dynamic_model_selection],
            #temperature=0.1,
            #max_tokens=1000,
            #timeout=30
        )

    def get_agent(self):
        return self.agent