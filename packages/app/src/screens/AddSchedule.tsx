import React, { useState, useEffect } from 'react';
import { ScrollView } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import styled from 'styled-components/native';
import Icon from 'react-native-vector-icons/MaterialIcons';

import authorizedRoute from '../components/common/authorizedRoute';
import Input from '../components/common/Input';
import Subtext from '../components/common/Subtext';
import { RawTeacherData } from '../types/schedule';
import { reportError, notify } from '../utils/utils';
import TeacherItem from '../components/add-schedule/TeacherItem';
import CurrentTeacherItem from '../components/add-schedule/CurrentTeacherItem';
import {
  FORM_BORDER_RADIUS, FORM_MARGIN_VERTICAL, FORM_PADDING_HORIZONTAL,
  SMALLTEXT_SIZE, LARGE_ICON_SIZE,
} from '../constants/style';
import { AppState } from '../types/store';
import { addTeacherSchedule, setTeacherSchedules } from '../actions/creators';
import {
  getUserScheduleFromHTML, parseHTMLFromURL, getTeacherURL, fetchTeachersFromQuery,
} from '../utils/process-info';
import client from '../utils/bugsnag';
import { SUCCESS } from '../constants/fetch';

const ListContainer = styled.View`
  border-radius: ${FORM_BORDER_RADIUS};
  background-color: ${({ theme }) => theme.foregroundColor};
  margin: ${FORM_MARGIN_VERTICAL} 0;
`;

const InfoContainer = styled.View`
  height: 50%;
  justify-content: center;
  align-items: center;
`;

const InfoText = styled(Subtext)`
  text-align: center;
`;

const Title = styled(Subtext)`
  margin-left: ${FORM_PADDING_HORIZONTAL};
  font-size: ${SMALLTEXT_SIZE};
`;

export default authorizedRoute('Add Schedule', function AddSchedule() {
  const teacherSchedules = useSelector(({ user }: AppState) => user.teacherSchedules);
  const theme = useSelector((state: AppState) => state.theme);
  const { username, password } = useSelector((state: AppState) => state.user);
  const dispatch = useDispatch();
  const [query, setQuery] = useState('');
  const [teachers, setTeachers] = useState<RawTeacherData[]>([]);
  const [addingTeacher, setAddingTeacher] = useState(false);
  const [removingTeacher, setRemovingTeacher] = useState(false);
  const controller = new AbortController();
  const signal = controller.signal;

  const fetchTeachers = async (teacherQuery: string) => {
    controller.abort();
    try {
      const json = await fetchTeachersFromQuery(teacherQuery, username, password, signal);
      const teachersAvailable = json.filter(({ firstName, lastName, email }: RawTeacherData) => {
        const alreadyAdded = teacherSchedules.some((teacherObj) => teacherObj.name === `${firstName} ${lastName}`);
        return email !== null && !alreadyAdded;
      });
      setTeachers(teachersAvailable);
    } catch (error) {
      if (error.name === 'AbortError') {
        return;
      }
      reportError(error);
    }
  };

  const addSchedule = ({ firstName, lastName, id }: RawTeacherData) => async () => {
    setAddingTeacher(true);
    client.leaveBreadcrumb(`Adding teacher schedule ${firstName} ${lastName}`);

    try {
      const name = `${firstName} ${lastName}`;
      const url = getTeacherURL(id, username, password);
      const $ = await parseHTMLFromURL(url, { signal, method: 'POST' });
      const schedule = await getUserScheduleFromHTML($);
      dispatch(addTeacherSchedule({ name, url, schedule }));
      notify(SUCCESS, `${name}'s schedule added!`);
      setTeachers([]);
      setQuery('');
    } catch (error) {
      reportError(error);
    }
    setAddingTeacher(false);
  };

  const removeSchedule = (name: string) => () => {
    setRemovingTeacher(true);
    client.leaveBreadcrumb(`Remove teacher schedule ${name}`);

    const removed = teacherSchedules.filter((teacher) => teacher.name !== name);
    dispatch(setTeacherSchedules(removed));
    notify(SUCCESS, `${name}'s schedule removed.`);
    setRemovingTeacher(false);
  };

  // useEffect cannot have async handlers and React Suspense isn't ready yet
  useEffect(() => {
    if (query.length === 0) {
      controller.abort();
      return setTeachers([]);
    }
    fetchTeachers(query);
    return () => controller.abort();
  }, [query]);

  const teacherItems = teachers.map((teacher) => (
    <TeacherItem key={teacher.id} teacher={teacher} onPress={addSchedule(teacher)} disabled={addingTeacher} />
  ));

  const currentTeachers = teacherSchedules.map(({ name }) => (
    <CurrentTeacherItem key={name} name={name} onPress={removeSchedule(name)} disabled={removingTeacher} />
  ));

  const currentTeachersInfo = (
    <>
      <Title>Current teachers' schedules</Title>
      <ListContainer>{currentTeachers}</ListContainer>
    </>
  );

  const info = (
    <InfoContainer>
      <Icon name="add" size={LARGE_ICON_SIZE} color={theme.subtextColor} />
      <InfoText numberOfLines={3}>
        Add a teacher's schedule. Once added, they will show up under your schedule.
      </InfoText>
    </InfoContainer>
  );

  const lists = (
    <ScrollView showsVerticalScrollIndicator={false}>
      <ListContainer>{teacherItems}</ListContainer>
      {teacherSchedules.length > 0 && currentTeachersInfo}
    </ScrollView>
  );

  return (
    <>
      <Input placeholder="Teacher Name" value={query} onChangeText={setQuery} />
      {query.length === 0 && teacherSchedules.length === 0 ? info : lists}
    </>
  );
});
