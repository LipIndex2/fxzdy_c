declare namespace ui.task {
	class TaskHeaderTipsView extends fgui.GComponent{
		public T_title:fgui.GTextField;
		public T_desc:fgui.GTextField;
		public G_h:fgui.GGroup;
		public bar:ui.task.bar.TaskHeaderTipsBar;
	}
	class TaskView extends fgui.GComponent{
		public tabList:fgui.GList;
		public bg:fgui.GLoader;
		public labelTitle:fgui.GTextField;
		public G_all:fgui.GGroup;
		public taskPartComp:ui.task.dailyTask.DailyTaskPartComponent;
		public tempTaskTab:ui.task.button.TaskTabButton;
		public achievementPartComp:ui.task.achievement.AchievementPartComponent;
	}
	class TrunkTaskView extends fgui.GComponent{
		public taskTips:ui.task.components.TaskSmallTipsComponents;
	}
}
declare namespace ui.task.achievement {
	class AchievementPartComponent extends fgui.GComponent{
		public bg:fgui.GImage;
		public taskList:fgui.GList;
	}
}
declare namespace ui.task.bar {
	class TaskHeaderTipsBar extends fgui.GProgressBar{
		public bar:fgui.GImage;
		public title:fgui.GTextField;
	}
}
declare namespace ui.task.button {
	class TaskDailyCompleteBtn extends fgui.GButton{
		public bgComplete:fgui.GLoader;
		public labelComplete:fgui.GTextField;
		public redDot:ui.comm.com.RedDot;
	}
	class TaskDailyDoneBtn extends fgui.GButton{
		public bgFinish:fgui.GImage;
		public labelFinish:fgui.GTextField;
	}
	class TaskDailyGoBtn extends fgui.GButton{
		public bgGo:fgui.GLoader;
		public labelGo:fgui.GTextField;
	}
	class TaskDailyPartButton extends fgui.GComponent{
		public btnGo:ui.task.button.TaskDailyGoBtn;
		public btnComplete:ui.task.button.TaskDailyCompleteBtn;
		public btnFinish:ui.task.button.TaskDailyDoneBtn;
	}
	class TaskTabButton extends fgui.GButton{
		public bgNoChoose:fgui.GLoader;
		public bgChoose:fgui.GLoader;
		public labelTitle:fgui.GTextField;
		public redDot:ui.comm.com.RedDot;
	}
}
declare namespace ui.task.common {
	class TaskOneRowComponent extends fgui.GComponent{
		public bg:fgui.GImage;
		public bgLeft:fgui.GImage;
		public fakeProgressBar:fgui.GLoader;
		public labelProgressBarValue:fgui.GTextField;
		public maskProgressBar:fgui.GLoader;
		public labelTaskTarget:fgui.GTextField;
		public labelTaskRewardText:fgui.GTextField;
		public labelScoreAdd:fgui.GTextField;
		public btnTask:ui.task.button.TaskDailyPartButton;
		public progressBarTask:ui.comm.progressBar.components.ProgressBar2;
		public rewardItem:ui.comm.item.ItemFrame;
	}
}
declare namespace ui.task.components {
	class TaskSmallTipsComponents extends fgui.GButton{
		public bgTaskDone:fgui.GLoader;
		public labelRewardTitle:fgui.GTextField;
		public doneSpineRoot:fgui.GTextField;
		public imageReward:fgui.GLoader;
		public labelRewardCount:fgui.GTextField;
		public bgTaskDoing:fgui.GLoader;
		public imageTaskTarget:fgui.GLoader;
		public labelTaskProgress:fgui.GTextField;
		public labelTaskTitle:fgui.GTextField;
	}
}
declare namespace ui.task.dailyTask {
	class DailyTaskPartComponent extends fgui.GComponent{
		public bgTask:fgui.GImage;
		public bgTitle:fgui.GImage;
		public labelDailyTaskTitle:fgui.GTextField;
		public labelTimeReset:fgui.GTextField;
		public taskList:fgui.GList;
		public weekComp:ui.task.dailyTask.TaskWeekScoreRewardComponent;
		public dailyComp:ui.task.dailyTask.TaskDailyScoreRewardComponent;
	}
	class TaskDailyScoreRewardComponent extends fgui.GComponent{
		public bg:fgui.GLoader;
		public labelTitle:fgui.GTextField;
		public labelScore:fgui.GTextField;
		public scorePercent20:ui.task.dailyTask.TaskRewardWithScoreComponent;
		public scorePercent40:ui.task.dailyTask.TaskRewardWithScoreComponent;
		public scorePercent100:ui.task.dailyTask.TaskRewardWithScoreComponent;
		public scorePercent60:ui.task.dailyTask.TaskRewardWithScoreComponent;
		public scorePercent80:ui.task.dailyTask.TaskRewardWithScoreComponent;
		public progressBarForScore:ui.comm.progressBar.components.ProgressBar2;
	}
	class TaskProgressBarScoreTitleCompent extends fgui.GComponent{
		public labelScore:fgui.GTextField;
		public imageTips:fgui.GGraph;
	}
	class TaskRewardImageComponent extends fgui.GComponent{
		public itemPart:ui.comm.item.ItemFrameBtn;
	}
	class TaskRewardWithScoreComponent extends fgui.GComponent{
		public scoreComp:ui.task.dailyTask.TaskProgressBarScoreTitleCompent;
		public redDot:ui.comm.com.RedDot;
		public itemPart:ui.comm.item.ItemFrame;
	}
	class TaskWeekScoreRewardComponent extends fgui.GComponent{
		public bg:fgui.GImage;
		public labelScore:fgui.GTextField;
		public labelTitle:fgui.GTextField;
		public scorePercent20:ui.task.dailyTask.TaskRewardWithScoreComponent;
		public scorePercent40:ui.task.dailyTask.TaskRewardWithScoreComponent;
		public scorePercent60:ui.task.dailyTask.TaskRewardWithScoreComponent;
		public scorePercent80:ui.task.dailyTask.TaskRewardWithScoreComponent;
		public scorePercent100:ui.task.dailyTask.TaskRewardWithScoreComponent;
		public progressBarForScore:ui.comm.progressBar.components.ProgressBar2;
	}
}
