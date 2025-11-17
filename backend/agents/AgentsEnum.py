from enum import Enum

class AgentsEnum(Enum):
    """Enumeration of available AI agents in the system"""
    
    # Core FreddyAI Assistant
    FREDDYAI_ASSISTANT = "FreddyAI_Assistant"
    
    # Analytics & Research
    REALITY_AGENT = "Reality_Agent"
    PERFORMANCE_AGENT = "Performance_Agent"
    TELESCOPE_AGENT = "Telescope_Agent"
    TRENDS_AGENT = "Trends_Agent"
    TASTE_LANDSCAPE_AGENT = "Taste_Landscape_Agent"
    
    # Strategic & Planning
    BWCS_AGENT = "BWCS_Agent"
        
    @classmethod
    def get_all_agents(cls):
        """Return a list of all agent values"""
        return [agent.value for agent in cls]
    
    @classmethod
    def get_agent_by_value(cls, value: str):
        """Get agent enum by its string value"""
        for agent in cls:
            if agent.value == value:
                return agent
        return None
    
    @classmethod
    def is_valid_agent(cls, value: str) -> bool:
        """Check if a string value is a valid agent"""
        return value in cls.get_all_agents()
    
    def __str__(self):
        return self.value