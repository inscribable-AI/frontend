import { db } from '../firebase/config';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  doc, 
  updateDoc, 
  deleteDoc,
  getDoc,
  limit,
  startAfter,
  Timestamp 
} from '@firebase/firestore';


const getDocId = async ({tasksCollection, taskId, threadId}) => {
    try{
      let querySnapshot;
      if(threadId){ 
        const q = query(tasksCollection, where("thread_id", "==", threadId));
        querySnapshot = await getDocs(q);
      }else{
        const q = query(tasksCollection, where("id", "==", taskId));
        querySnapshot = await getDocs(q);
      }
      
      if (querySnapshot.empty) {
        return {message: `document not found`, error: true, data: null}
        //throw new Error(`Task with ID ${taskId} not found`);
      }
      
      // Get the Firestore document ID from the query result
      const firestoreDocId = querySnapshot.docs[0].id;
      return {message: `document id found`, error: false, data: firestoreDocId}
    }catch(e){
      console.log("error in getStoreId", e)
      return {message: `Error in getStoreId`, error: true, data: null}
    }
  }

export const firebaseService = {
  getUserTasks: async (userId, pageSize = 10, lastTaskId = null) => {
    try {
      let tasksQuery = query(
        collection(db, 'tasks'),
        where('userId', '==', userId),
        orderBy('updatedAt', 'desc'),
        limit(pageSize)
      );

      // If lastTaskId is provided, use it for pagination
      if (lastTaskId) {
        const {data: firestoreDocId} = await getDocId({tasksCollection: collection(db, 'tasks'), taskId: lastTaskId})
        const lastTaskDoc = await getDoc(doc(db, 'tasks', firestoreDocId));
        tasksQuery = query(
          collection(db, 'tasks'),
          where('userId', '==', userId),
          orderBy('updatedAt', 'desc'),
          startAfter(lastTaskDoc),
          limit(pageSize)
        );
      }

      const querySnapshot = await getDocs(tasksQuery);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting user tasks:', error);
      throw error;
    }
  },

  getUserTaskSummary: async (userId) => {
    try {
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('userId', '==', userId)
      );

      const querySnapshot = await getDocs(tasksQuery);
      const tasks = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Calculate summary statistics
      const summary = {
        total: tasks.length,
        pending: tasks.filter(task => task.status === 'pending').length,
        completed: tasks.filter(task => task.status === 'completed').length,
        upcoming: tasks.filter(task => {
          const scheduledTime = task.scheduledTime.toDate();
          return scheduledTime > new Date();
        }).length
      };

      return summary;
    } catch (error) {
      console.error('Error getting user task summary:', error);
      throw error;
    }
  },

  getUserAverageResponseTime: async (userId) => {
    try {
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('userId', '==', userId),
        where('status', '==', 'completed')
      );

      const querySnapshot = await getDocs(tasksQuery);
      const tasks = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Calculate average response time
      let totalResponseTime = 0;
      let count = 0;

      tasks.forEach(task => {
        if (task.completedAt && task.createdAt) {
          // Convert Firestore timestamps to JavaScript Date objects if needed
          const completedTime = task.completedAt instanceof Timestamp 
            ? task.completedAt.toDate() 
            : new Date(task.completedAt);
            
          const createdTime = task.createdAt instanceof Timestamp 
            ? task.createdAt.toDate() 
            : new Date(task.createdAt);
            
          const responseTime = (completedTime - createdTime) / 1000; // Convert to seconds
          totalResponseTime += responseTime;
          count++;
        }
      });

      return count > 0 ? Math.round(totalResponseTime / count) : 0;
    } catch (error) {
      console.error('Error getting user average response time:', error);
      return 0; // Return 0 on error
    }
  },

  getUserScheduledTasks: async (userId, pageSize = 10, lastTaskId = null) => {
    try {
      let tasksQuery = query(
        collection(db, 'tasks'),
        where('userId', '==', userId),
        where('status', '==', 'pending'),
        orderBy('scheduledTime', 'asc'),
        limit(pageSize)
      );

      // If lastTaskId is provided, use it for pagination
      if (lastTaskId) {
        const {data: firestoreDocId} = await getDocId({tasksCollection: collection(db, 'tasks'), taskId: lastTaskId})
        const lastTaskDoc = await getDoc(doc(db, 'tasks', firestoreDocId));
        tasksQuery = query(
          collection(db, 'tasks'),
          where('userId', '==', userId),
          where('status', '==', 'pending'),
          orderBy('scheduledTime', 'asc'),
          startAfter(lastTaskDoc),
          limit(pageSize)
        );
      }

      const querySnapshot = await getDocs(tasksQuery);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting scheduled tasks:', error);
      throw error;
    }
  },

  getTaskByAgentId: async (agentId, pageSize = 10, lastTaskId = null) => {
    try {
      let tasksQuery;
      
      // Only use startAfter when lastTaskId is provided
      if (lastTaskId && lastTaskId !== null) {
        // Get the document reference for the last task
        const lastTaskDoc = await getDoc(doc(db, 'tasks', lastTaskId));
        
        // Only proceed with pagination if the document exists
        if (lastTaskDoc.exists()) {
          tasksQuery = query(
            collection(db, 'tasks'),
            where('agentId', '==', agentId),
            orderBy('createdAt', 'desc'),
            startAfter(lastTaskDoc),
            limit(pageSize)
          );
        } else {
          // Fallback if the document doesn't exist
          tasksQuery = query(
            collection(db, 'tasks'),
            where('agentId', '==', agentId),
            orderBy('createdAt', 'desc'),
            limit(pageSize)
          );
        }
      } else {
        // Initial query without pagination
        tasksQuery = query(
          collection(db, 'tasks'),
          where('agentId', '==', agentId),
          orderBy('createdAt', 'desc'),
          limit(pageSize)
        );
      }
      
      const querySnapshot = await getDocs(tasksQuery);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting tasks by agent ID:', error);
      throw error;
    }
  },

  getTaskById: async (taskId) => {
    try {
        
        //task id is the  user created  id on firestore not firestore id
        const {data: firestoreDocId, error: firestoreDocIdError, message: firestoreDocIdMessage} = await getDocId({tasksCollection: collection(db, 'tasks'), taskId: taskId})
        if(firestoreDocIdError){
            throw new Error(firestoreDocIdMessage)
        }
        
      const docRef = doc(db, 'tasks', firestoreDocId);
      const docSnap = await getDoc(docRef);
      if (!docSnap.exists()) {
        throw new Error('Task not found');
      }

      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } catch (error) {
      console.error('Error getting task by ID:', error);
      throw error;
    }
  },

  updateScheduledTask: async (taskId, updateData) => {
    try {
        const {data: firestoreDocId, error: firestoreDocIdError, message: firestoreDocIdMessage} = await getDocId({tasksCollection: collection(db, 'tasks'), taskId: taskId})
        if(firestoreDocIdError){
            throw new Error(firestoreDocIdMessage)
        }

      const docRef = doc(db, 'tasks', firestoreDocId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Task not found');
      }

      // Parse dates if they exist in updateData
      if (updateData.scheduledTime) {
        updateData.scheduledTime = Timestamp.fromDate(new Date(updateData.scheduledTime));
      }
      if (updateData.recurrenceEndTime) {
        updateData.recurrenceEndTime = Timestamp.fromDate(new Date(updateData.recurrenceEndTime));
      }

      await updateDoc(docRef, {
        ...updateData,
        updatedAt: Timestamp.now()
      });

      // Get updated task
      const updatedDoc = await getDoc(docRef);
      return {
        id: updatedDoc.id,
        ...updatedDoc.data()
      };
    } catch (error) {
      console.error('Error updating scheduled task:', error);
      throw error;
    }
  },

  deleteScheduledTask: async (taskId) => {
    try {
        const {data: firestoreDocId, error: firestoreDocIdError, message: firestoreDocIdMessage} = await getDocId({tasksCollection: collection(db, 'tasks'), taskId: taskId})
        if(firestoreDocIdError){
            throw new Error(firestoreDocIdMessage)
        }
      const docRef = doc(db, 'tasks', firestoreDocId);
      const docSnap = await getDoc(docRef);

      if (!docSnap.exists()) {
        throw new Error('Task not found');
      }

      await deleteDoc(docRef);
      return true;
    } catch (error) {
      console.error('Error deleting scheduled task:', error);
      throw error;
    }
  },

  getTasksByTeamId: async (teamId, pageSize = 10, lastTaskId = null) => {
    try {
      let tasksQuery;
      
      if (lastTaskId) {
        const {data: firestoreDocId} = await getDocId({tasksCollection: collection(db, 'tasks'), taskId: lastTaskId})
        const lastTaskDoc = await getDoc(doc(db, 'tasks', firestoreDocId));
        
        tasksQuery = query(
          collection(db, 'tasks'),
          where('teamId', '==', teamId),
          orderBy('createdAt', 'desc'),
          startAfter(lastTaskDoc),
          limit(pageSize)
        );
      } else {
        tasksQuery = query(
          collection(db, 'tasks'),
          where('teamId', '==', teamId),
          orderBy('createdAt', 'desc'),
          limit(pageSize)
        );
      }
      
      const querySnapshot = await getDocs(tasksQuery);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting tasks by team ID:', error);
      throw error;
    }
  },

  getAgentsByTeamId: async (teamId, pageSize = 10, lastAgentId = null) => {
    try {
      let agentsQuery;
      
      if (lastAgentId) {
        const lastAgentDoc = await getDoc(doc(db, 'agents', lastAgentId));
        
        agentsQuery = query(
          collection(db, 'agents'),
          where('teamId', '==', teamId),
          orderBy('name', 'asc'),
          startAfter(lastAgentDoc),
          limit(pageSize)
        );
      } else {
        agentsQuery = query(
          collection(db, 'agents'),
          where('teamId', '==', teamId),
          orderBy('name', 'asc'),
          limit(pageSize)
        );
      }
      
      const querySnapshot = await getDocs(agentsQuery);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting agents by team ID:', error);
      throw error;
    }
  },

  /**
   * Get task activity within a date range for a specific user
   * @param {string} userId - The user ID
   * @param {string} startDate - Start date in ISO format (YYYY-MM-DD)
   * @param {string} endDate - End date in ISO format (YYYY-MM-DD)
   * @returns {Promise<Array>} - Array of daily task counts
   */
  getUserTaskActivityByDateRange: async (userId, startDate, endDate) => {
    try {
      // Convert string dates to Date objects with time set to beginning/end of day
      const startDateTime = new Date(startDate);
      startDateTime.setHours(0, 0, 0, 0);
      
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);
      
      // Convert to Firestore Timestamp
      const startTimestamp = Timestamp.fromDate(startDateTime);
      const endTimestamp = Timestamp.fromDate(endDateTime);
      
      console.log(`Fetching tasks for user ${userId} from ${startDateTime} to ${endDateTime}`);
      
      // Query tasks within the date range for this user
      const tasksQuery = query(
        collection(db, 'tasks'),
        where('userId', '==', userId),
        where('createdAt', '>=', startTimestamp),
        where('createdAt', '<=', endTimestamp),
        orderBy('createdAt', 'asc')
      );
      
      const querySnapshot = await getDocs(tasksQuery);
      
      // Group tasks by date
      const tasksByDate = {};
      
      // Fill in all dates in the range with zero counts first
      const dateRange = getDatesInRange(startDateTime, endDateTime);
      dateRange.forEach(date => {
        const dateString = formatDateKey(date);
        tasksByDate[dateString] = 0;
      });
      
      // Count tasks by date
      querySnapshot.forEach(doc => {
        const task = doc.data();
        const taskDate = task.createdAt.toDate();
        const dateKey = formatDateKey(taskDate);
        
        // Increment the count for this date
        tasksByDate[dateKey] = (tasksByDate[dateKey] || 0) + 1;
      });
      
      // Convert to array format for the chart
      const activityData = Object.keys(tasksByDate).map(dateKey => ({
        date: dateKey,
        count: tasksByDate[dateKey]
      }));
      
      return activityData;
    } catch (error) {
      console.error('Error getting user task activity:', error);
      return [];
    }
  }
}; 

export const firebaseMessageService = {
  getMessagesByThreadId: async (threadId, pageSize = 20, lastMessageId = null) => {
    try {
      // Query for messages matching the thread ID with pagination
      let messagesQuery;
      
      if (lastMessageId) {
        const lastMessageDoc = await getDoc(doc(db, 'taskMessages', lastMessageId));
        
        messagesQuery = query(
          collection(db, 'taskMessages'),
          where('thread_id', '==', threadId),
          orderBy('timestamp', 'desc'),
          startAfter(lastMessageDoc),
          limit(pageSize)
        );
      } else {
        messagesQuery = query(
          collection(db, 'taskMessages'),
          where('thread_id', '==', threadId),
          orderBy('timestamp', 'desc'),
          limit(pageSize)
        );
      }
      
      const querySnapshot = await getDocs(messagesQuery);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting messages by thread ID:', error);
      throw error;
    }
  },

  getTaskByThreadId: async (threadId, pageSize = 10, lastTaskId = null) => {
    try {
      // Query for tasks matching the thread ID with pagination
      let tasksQuery;
      
      if (lastTaskId) {
        const lastTaskDoc = await getDoc(doc(db, 'tasks', lastTaskId));
        
        if (lastTaskDoc.exists()) {
          tasksQuery = query(
            collection(db, 'tasks'),
            where('thread_id', '==', threadId),
            orderBy('createdAt', 'desc'),
            startAfter(lastTaskDoc),
            limit(pageSize)
          );
        } else {
          tasksQuery = query(
            collection(db, 'tasks'),
            where('thread_id', '==', threadId),
            orderBy('createdAt', 'desc'),
            limit(pageSize)
          );
        }
      } else {
        tasksQuery = query(
          collection(db, 'tasks'),
          where('thread_id', '==', threadId),
          orderBy('createdAt', 'desc'),
          limit(pageSize)
        );
      }
      
      const querySnapshot = await getDocs(tasksQuery);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting tasks by thread ID:', error);
      throw error;
    }
  },

  getChatHistory: async (threadId, pageSize = 20, lastMessageId = null) => {
    try {
      let messagesQuery;
      
      if (lastMessageId) {
        const lastMessageDoc = await getDoc(doc(db, 'taskMessages', lastMessageId));  
        messagesQuery = query(
          collection(db, 'taskMessages'),
          where('thread_id', '==', threadId),
          orderBy('timestamp', 'desc'),
          startAfter(lastMessageDoc),
          limit(pageSize) 
        );
      } else {
        messagesQuery = query(
          collection(db, 'taskMessages'),
          where('thread_id', '==', threadId),
          orderBy('timestamp', 'desc'), 
          limit(pageSize)
        );
      }
      
      const querySnapshot = await getDocs(messagesQuery);
      return querySnapshot.docs.map(doc => ({
        id: doc.id, 
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting task messages by thread ID:', error);
      throw error;
    }
  },

  
  getTeamThreadIds: async (teamId) => {
    try {
      const querySnapshot = await getDocs(query(collection(db, 'chats'), where('teamId', '==', teamId)));
      return querySnapshot.docs.map(doc => doc.id);
    } catch (error) {
      console.error('Error getting team thread IDs:', error);
      throw error;
    }
  },

  getTeamChat: async (threadId, pageSize = 20, lastMessageId = null) => {   
    try {
      let messagesQuery;
      
      if (lastMessageId) {
        const lastMessageDoc = await getDoc(doc(db, 'chats', lastMessageId));  
        messagesQuery = query(
          collection(db, 'chats'),
          where('thread_id', '==', threadId),
          orderBy('timestamp', 'desc'),
          startAfter(lastMessageDoc),
          limit(pageSize)
        );  
      } else {
        messagesQuery = query(
          collection(db, 'chats'),
          where('thread_id', '==', threadId),
          orderBy('timestamp', 'desc'),
          limit(pageSize)
        );  
      } 

      const querySnapshot = await getDocs(messagesQuery);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting team chat:', error);
      throw error;
    }
  },

  getAllMessages: async (pageSize = 20, lastMessageId = null) => {
    try {
      let messagesQuery;
      
      if (lastMessageId) {
        const lastMessageDoc = await getDoc(doc(db, 'taskMessages', lastMessageId));
        
        if (lastMessageDoc.exists()) {
          messagesQuery = query(
            collection(db, 'taskMessages'),
            orderBy('timestamp', 'desc'),
            startAfter(lastMessageDoc),
            limit(pageSize)
          );
        } else {
          messagesQuery = query(
            collection(db, 'taskMessages'),
            orderBy('timestamp', 'desc'),
            limit(pageSize)
          );
        }
      } else {
        messagesQuery = query(
          collection(db, 'taskMessages'),
          orderBy('timestamp', 'desc'),
          limit(pageSize)
        );
      }
      
      const querySnapshot = await getDocs(messagesQuery);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting messages:', error);
      throw error;
    }
  },

  
}

// Helper function to get all dates in a range
function getDatesInRange(startDate, endDate) {
  const dates = [];
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return dates;
}

// Helper function to format date as YYYY-MM-DD
function formatDateKey(date) {
  return date.toISOString().split('T')[0];
}